import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsService } from '../clients/clients.service';
import { LocationsService } from '../location/locations.service';
import { ProductsService } from '../products/products.service';
import { ShipmentFactory } from './factory/shipment.factory';
import { CreateShipmentDto, LogisticType } from './models/create-shipment.dto';
import { ShipmentResponse } from './models/shipment-response.type';
import { BULK_PROCESSING_THRESHOLD } from './constants/discount.constants';
import { generateNextTrackingNumber } from '../shared/guide-number.generator';

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
    @InjectQueue('shipments') private readonly shipmentsQueue: Queue,
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

    // 5 — Validar existencia de cada producto y calcular totalUnits y basePrice
    const { totalUnits, basePrice, mergedItems } =
      await this.validateItemsAndGetTotal(dto.items);

    // 6 — Generar trackingNumber automático si no se proporciona
    const trackingNumber =
      dto.guideNumber || (await this.generateNextTrackingNumber());
    dto.guideNumber = trackingNumber;

    // 7 — Calcular precios con la estrategia correspondiente
    const priceCalculation = strategy.calculatePrice(basePrice, totalUnits);

    // 8 — Procesamiento en background si supera el umbral
    if (totalUnits > BULK_PROCESSING_THRESHOLD) {
      return this.enqueueBulkShipment(dto, totalUnits, priceCalculation);
    }

    // 9 — Persistir sincrónicamente
    return this.persistShipment(
      dto,
      trackingNumber,
      totalUnits,
      priceCalculation,
      mergedItems,
    );
  }

  async findAll(): Promise<ShipmentResponse[]> {
    await this.autoCompleteByDeliveryDate();

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

  async reject(id: string): Promise<ShipmentResponse> {
    const shipment = await this.findById(id);

    if (shipment.status === 'REJECTED') {
      throw new BadRequestException(`El envío ya está rechazado`);
    }

    return this.prisma.shipment.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: this.buildIncludes(),
    }) as unknown as ShipmentResponse;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);

    await this.prisma.shipment.delete({ where: { id } });
  }

  async getNextTrackingNumber(): Promise<string> {
    return this.generateNextTrackingNumber();
  }

  //Métodos privados

  private async autoCompleteByDeliveryDate(): Promise<void> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    await this.prisma.shipment.updateMany({
      where: {
        deliveryDate: { lt: startOfToday },
        status: { notIn: ['COMPLETED', 'REJECTED', 'FAILED'] },
      },
      data: { status: 'COMPLETED' },
    });
  }

  /**
   * Genera el siguiente número de guía (trackingNumber) disponible.
   * Obtiene todos los shipments existentes y calcula el siguiente número secuencial.
   * @returns Siguiente trackingNumber en formato AA00000000
   */
  private async generateNextTrackingNumber(): Promise<string> {
    const last = await this.prisma.shipment.findFirst({
      select: { trackingNumber: true },
      orderBy: { trackingNumber: 'desc' },
    });

    return generateNextTrackingNumber(last?.trackingNumber);
  }

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
   * Verifica productos del envío, calcula la suma total de unidades
   * y el precio base como sum(unitPrice * quantity).
   * @param items Lista de productos, cantidades y precios unitarios.
   * @returns Total de unidades y precio base del envío.
   */
  private async validateItemsAndGetTotal(
    items: CreateShipmentDto['items'],
  ): Promise<{
    totalUnits: number;
    basePrice: number;
    mergedItems: CreateShipmentDto['items'];
  }> {
    if (!items || items.length === 0) {
      throw new BadRequestException('El envío debe tener al menos un producto');
    }

    const itemMap = new Map<string, CreateShipmentDto['items'][number]>();
    for (const item of items) {
      const existing = itemMap.get(item.productId);
      if (existing) {
        itemMap.set(item.productId, {
          ...existing,
          quantity: existing.quantity + item.quantity,
        });
      } else {
        itemMap.set(item.productId, { ...item });
      }
    }
    const mergedItems = Array.from(itemMap.values());

    await Promise.all(
      mergedItems.map((item) => this.productsService.findById(item.productId)),
    );

    const totalUnits = mergedItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    const basePrice = mergedItems.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    );

    return { totalUnits, basePrice, mergedItems };
  }

  /**
   * Genera una respuesta de encolamiento para envíos masivos.
   * Crea el shipment con status PENDING y encola el procesamiento de productos.
   * @param dto Datos completos del envío.
   * @param totalUnits Cantidad total de unidades del envío.
   * @param priceCalculation Resultado del cálculo de precios y descuento.
   * @returns Identificador del job y mensaje de confirmación.
   */
  private async enqueueBulkShipment(
    dto: CreateShipmentDto,
    totalUnits: number,
    priceCalculation: {
      basePrice: import('@prisma/client').Prisma.Decimal;
      discount: import('@prisma/client').Prisma.Decimal;
      finalPrice: import('@prisma/client').Prisma.Decimal;
    },
  ): Promise<{ jobId: string; message: string }> {
    const trackingNumber =
      dto.guideNumber || (await this.generateNextTrackingNumber());

    // 1. Crear el shipment con status PENDING (sin productos aún)
    const shipment = await this.prisma.shipment.create({
      data: {
        trackingNumber,
        transportMode: dto.logisticType,
        customerId: dto.clientId,
        basePrice: priceCalculation.basePrice,
        discountValue: priceCalculation.discount,
        totalCost: priceCalculation.finalPrice,
        deliveryDate: new Date(dto.deliveryAt),
        status: 'PROCESSING', // El processor lo cambiarás a COMPLETED
      },
    });

    // 2. Encolar el procesamiento de productos
    const job = await this.shipmentsQueue.add(
      'bulk-create',
      {
        dto,
        totalUnits,
        priceCalculation,
        trackingNumber,
      },
      {
        jobId: `bulk-${shipment.id}`,
      },
    );

    return {
      jobId: String(job.id),
      message: `Envío con ${totalUnits} unidades encolado para procesamiento en background. Tracking: ${trackingNumber}. El estado se actualizará cuando se complete.`,
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
    trackingNumber: string,
    totalUnits: number,
    priceCalculation: {
      basePrice: import('@prisma/client').Prisma.Decimal;
      discount: import('@prisma/client').Prisma.Decimal;
      finalPrice: import('@prisma/client').Prisma.Decimal;
    },
    mergedItems: CreateShipmentDto['items'],
  ): Promise<ShipmentResponse> {
    const destination = this.shipmentFactory
      .createStrategy(dto.logisticType)
      .getDestinationId(dto);

    // El cast es necesario porque Prisma no infiere el tipo con relaciones
    // cuando `include` proviene de un método en lugar de un literal inline.
    return this.prisma.shipment.create({
      data: {
        trackingNumber,
        transportMode: dto.logisticType,
        customerId: dto.clientId,
        basePrice: priceCalculation.basePrice,
        discountValue: priceCalculation.discount,
        totalCost: priceCalculation.finalPrice,
        deliveryDate: new Date(dto.deliveryAt),
        products: {
          create: mergedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
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
    }) as unknown as ShipmentResponse;
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
