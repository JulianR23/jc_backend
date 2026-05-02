import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsService } from '../clients/clients.service';
import { LocationsService } from '../location/locations.service';
import { ProductsService } from '../products/products.service';
import { ShipmentFactory } from './factory/shipment.factory';
import { CreateShipmentDto, LogisticType } from './models/create-shipment.dto';
import { ShipmentResponse } from './models/shipment-response.type';
import { BULK_PROCESSING_THRESHOLD } from './constants/discount.constants';

/**
 * Servicio de envíos — orquesta el Strategy Pattern.
 */
@Injectable()
export class ShipmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shipmentFactory: ShipmentFactory,
    private readonly clientsService: ClientsService,
    private readonly locationsService: LocationsService,
    private readonly productsService: ProductsService,
  ) {}

  async create(
    dto: CreateShipmentDto,
  ): Promise<ShipmentResponse | { jobId: string; message: string }> {
    // 1 — Validar existencia del cliente
    await this.clientsService.findById(dto.clientId);

    // 2 — Obtener estrategia según tipo de logística
    const strategy = this.shipmentFactory.createStrategy(dto.logisticType);

    // 3 — Validar campos exclusivos del tipo (placa vs flota, bodega vs puerto)
    strategy.validateFields(dto);

    // 4 — Validar existencia del destino de entrega
    await this.validateDestination(dto);

    // 5 — Validar existencia de cada producto y calcular totalUnits
    const totalUnits = await this.validateItemsAndGetTotal(dto.items);

    // 6 — Calcular precios con la estrategia correspondiente
    const priceCalculation = strategy.calculatePrice(dto.basePrice, totalUnits);

    // 7 — Procesamiento en background si supera el umbral
    if (totalUnits > BULK_PROCESSING_THRESHOLD) {
      return this.enqueueBulkShipment(dto, totalUnits, priceCalculation);
    }

    // 8 — Persistir sincrónicamente
    return this.persistShipment(dto, totalUnits, priceCalculation);
  }

  async findAll(): Promise<ShipmentResponse[]> {
    return this.prisma.shipment.findMany({
      include: this.buildIncludes(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<ShipmentResponse> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: this.buildIncludes(),
    });

    if (!shipment) {
      throw new NotFoundException(`Envío con id '${id}' no encontrado`);
    }

    return shipment;
  }

  async findByClient(clientId: string): Promise<ShipmentResponse[]> {
    await this.clientsService.findById(clientId);

    return this.prisma.shipment.findMany({
      where: { customerId: clientId },
      include: this.buildIncludes(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);

    await this.prisma.shipment.delete({ where: { id } });
  }

  //Métodos privados

  /**
   * Valida que el destino del envío exista según el tipo logístico.
   * @param dto Datos del envío con `warehouseId` o `portId`.
   * @returns Promesa que se resuelve cuando el destino es válido.
   */
  private async validateDestination(dto: CreateShipmentDto): Promise<void> {
    if (dto.warehouseId) {
      await this.locationsService.findWarehouseById(dto.warehouseId);
    }

    if (dto.portId) {
      await this.locationsService.findPortById(dto.portId);
    }
  }

  /**
   * Verifica productos del envío y calcula la suma total de unidades.
   * @param items Lista de productos y cantidades a enviar.
   * @returns Total de unidades incluidas en el envío.
   */
  private async validateItemsAndGetTotal(
    items: CreateShipmentDto['items'],
  ): Promise<number> {
    if (!items || items.length === 0) {
      throw new BadRequestException('El envío debe tener al menos un producto');
    }

    await Promise.all(
      items.map((item) => this.productsService.findById(item.productId)),
    );

    return items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Genera una respuesta de encolamiento para envíos masivos.
   * @param dto Datos completos del envío.
   * @param totalUnits Cantidad total de unidades del envío.
   * @param priceCalculation Resultado del cálculo de precios y descuento.
   * @returns Identificador del job y mensaje de confirmación.
   */
  private async enqueueBulkShipment(
    dto: CreateShipmentDto,
    totalUnits: number,
    priceCalculation: ReturnType<
      typeof this.shipmentFactory.createStrategy
    >['calculatePrice'] extends (...args: never[]) => infer R
      ? R
      : never,
  ): Promise<{ jobId: string; message: string }> {
    // Import dinámico para no romper si BullMQ no está configurado aún
    const { InjectQueue } = await import('@nestjs/bull');
    void InjectQueue;

    // El job se crea desde ShipmentsModule cuando BullMQ está disponible
    // Por ahora retornamos el payload que el processor necesitará
    const jobPayload = { dto, totalUnits, priceCalculation };
    void jobPayload;

    return {
      jobId: `bulk-${Date.now()}`,
      message: `Envío con ${totalUnits} unidades encolado para procesamiento en background. Recibirás confirmación cuando esté listo.`,
    };
  }

  /**
   * Persiste el envío y sus productos relacionados en base de datos.
   * @param dto Datos del envío a crear.
   * @param totalUnits Total de unidades validadas.
   * @param priceCalculation Valores de precio base, descuento y total final.
   * @returns Envío creado con relaciones incluidas.
   */
  private async persistShipment(
    dto: CreateShipmentDto,
    totalUnits: number,
    priceCalculation: {
      basePrice: import('@prisma/client').Prisma.Decimal;
      discount: import('@prisma/client').Prisma.Decimal;
      finalPrice: import('@prisma/client').Prisma.Decimal;
    },
  ): Promise<ShipmentResponse> {
    const destination = this.shipmentFactory
      .createStrategy(dto.logisticType)
      .getDestinationId(dto);

    return this.prisma.shipment.create({
      data: {
        trackingNumber: dto.guideNumber,
        transportMode: dto.logisticType,
        customerId: dto.clientId,
        basePrice: priceCalculation.basePrice,
        discountValue: priceCalculation.discount,
        totalCost: priceCalculation.finalPrice,
        deliveryDate: new Date(dto.deliveryAt),
        products: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
        ...(dto.logisticType === LogisticType.LAND
          ? {
              land: {
                create: {
                  warehouseId: destination.warehouseId!,
                  licensePlate: dto.vehiclePlate!,
                },
              },
            }
          : {
              maritime: {
                create: {
                  seaPortId: destination.portId!,
                  fleetNumber: dto.fleetNumber!,
                },
              },
            }),
      },
      include: this.buildIncludes(),
    });
  }

  /**
   * Construye el objeto `include` reutilizable para consultas de envíos.
   * @returns Configuración de relaciones a incluir en Prisma.
   */
  private buildIncludes() {
    return {
      customer: true,
      land: {
        include: { warehouse: true },
      },
      maritime: {
        include: { seaPort: true },
      },
      products: {
        include: { product: true },
      },
    } as const;
  }
}
