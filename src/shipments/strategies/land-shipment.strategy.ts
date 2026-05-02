import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DISCOUNT_THRESHOLD,
  LAND_DISCOUNT_RATE,
} from '../constants/discount.constants';
import { CreateShipmentDto } from '../models/create-shipment.dto';
import {
  PriceCalculation,
  ShipmentStrategy,
} from './shipment-strategy.interface';

/**
 * Estrategia de logística terrestre.
 *
 * Reglas de negocio aplicadas:
 * - Descuento del 5% si totalUnits > 10
 * - Requiere vehiclePlate (validado en DTO con @IsVehiclePlate)
 * - Requiere warehouseId como destino de entrega
 * - No permite portId ni fleetNumber
 */
@Injectable()
export class LandShipmentStrategy implements ShipmentStrategy {
  calculatePrice(basePrice: number, totalUnits: number): PriceCalculation {
    const base = new Prisma.Decimal(basePrice);
    const hasDiscount = totalUnits > DISCOUNT_THRESHOLD;
    const discountRate = hasDiscount ? LAND_DISCOUNT_RATE : 0;
    const discount = base.mul(discountRate);
    const finalPrice = base.sub(discount);

    return {
      basePrice: base,
      discount,
      finalPrice,
    };
  }

  validateFields(dto: CreateShipmentDto): void {
    if (!dto.vehiclePlate) {
      throw new BadRequestException(
        'La logística terrestre requiere el campo vehiclePlate',
      );
    }

    if (!dto.warehouseId) {
      throw new BadRequestException(
        'La logística terrestre requiere el campo warehouseId',
      );
    }

    if (dto.portId) {
      throw new BadRequestException('La logística terrestre no admite portId');
    }

    if (dto.fleetNumber) {
      throw new BadRequestException(
        'La logística terrestre no admite fleetNumber',
      );
    }
  }

  getDestinationId(dto: CreateShipmentDto): { warehouseId: string } {
    return { warehouseId: dto.warehouseId as string };
  }
}
