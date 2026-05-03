import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShipmentDto, LogisticType } from '../models/create-shipment.dto';

@Processor('shipments')
export class ShipmentProcessor {
  private readonly logger = new Logger(ShipmentProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('bulk-create')
  async processBulkShipment(
    job: Job<{
      dto: CreateShipmentDto;
      totalUnits: number;
      priceCalculation: {
        basePrice: import('@prisma/client').Prisma.Decimal;
        discount: import('@prisma/client').Prisma.Decimal;
        finalPrice: import('@prisma/client').Prisma.Decimal;
      };
      trackingNumber: string;
    }>,
  ) {
    try {
      const { dto, totalUnits, priceCalculation, trackingNumber } = job.data;

      this.logger.log(`Procesando envío masivo: ${trackingNumber}`);
      await job.progress(10);

      // Encontrar el shipment pendiente
      const shipment = await this.prisma.shipment.findUnique({
        where: { trackingNumber },
      });

      if (!shipment) {
        throw new Error(
          `Shipment con tracking ${trackingNumber} no encontrado`,
        );
      }

      // Crear los productos
      const mergedItems = this.mergeDuplicateItems(dto.items);

      await this.prisma.shipmentProduct.createMany({
        data: mergedItems.map((item) => ({
          shipmentId: shipment.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      await job.progress(50);

      // Crear las relaciones especializadas (land o maritime)
      if (dto.logisticType === LogisticType.LAND) {
        await this.prisma.land.create({
          data: {
            shipmentId: shipment.id,
            warehouseId: dto.warehouseId!,
            licensePlate: dto.vehiclePlate!,
          },
        });
      } else {
        await this.prisma.maritime.create({
          data: {
            shipmentId: shipment.id,
            seaPortId: dto.portId!,
            fleetNumber: dto.fleetNumber!,
          },
        });
      }

      await job.progress(90);

      // El procesamiento de datos terminó — el status pasa a PENDING.
      // COMPLETED se asigna automáticamente cuando deliveryDate ya pasó.
      await this.prisma.shipment.update({
        where: { id: shipment.id },
        data: { status: 'PENDING' },
      });

      await job.progress(100);
      this.logger.log(`Envío masivo procesado exitosamente: ${trackingNumber}`);

      return {
        shipmentId: shipment.id,
        trackingNumber,
        status: 'PENDING',
      };
    } catch (error) {
      this.logger.error(
        `Error procesando envío masivo: ${error.message}`,
        error.stack,
      );

      // Marcar como fallido en BD
      if (job.data?.trackingNumber) {
        await this.prisma.shipment
          .update({
            where: { trackingNumber: job.data.trackingNumber },
            data: { status: 'FAILED' },
          })
          .catch(() => {});
      }

      throw error;
    }
  }

  private mergeDuplicateItems(
    items: CreateShipmentDto['items'],
  ): CreateShipmentDto['items'] {
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
    return Array.from(itemMap.values());
  }
}
