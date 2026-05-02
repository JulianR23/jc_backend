import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DISCOUNT_THRESHOLD,
  MARITIME_DISCOUNT_RATE,
} from '../constants/discount.constants';
import { CreateShipmentDto } from '../models/create-shipment.dto';
import {
  PriceCalculation,
  ShipmentStrategy,
} from './shipment-strategy.interface';

/**
 * Estrategia de logística marítima.
 *
 * Reglas de negocio aplicadas:
 * - Descuento del 3% si totalUnits > 10
 * - Requiere fleetNumber (validado en DTO con @IsFleetNumber)
 * - Requiere portId como destino de entrega
 * - No permite warehouseId ni vehiclePlate
 */
@Injectable()
export class MaritimeShipmentStrategy implements ShipmentStrategy {
  calculatePrice(basePrice: number, totalUnits: number): PriceCalculation {
    const base = new Prisma.Decimal(basePrice);
    const hasDiscount = totalUnits > DISCOUNT_THRESHOLD;
    const discountRate = hasDiscount ? MARITIME_DISCOUNT_RATE : 0;
    const discount = base.mul(discountRate);
    const finalPrice = base.sub(discount);

    return {
      basePrice: base,
      discount,
      finalPrice,
    };
  }

  validateFields(dto: CreateShipmentDto): void {
    if (!dto.fleetNumber) {
      throw new BadRequestException(
        'La logística marítima requiere el campo fleetNumber',
      );
    }

    if (!dto.portId) {
      throw new BadRequestException(
        'La logística marítima requiere el campo portId',
      );
    }

    if (dto.warehouseId) {
      throw new BadRequestException(
        'La logística marítima no admite warehouseId',
      );
    }

    if (dto.vehiclePlate) {
      throw new BadRequestException(
        'La logística marítima no admite vehiclePlate',
      );
    }
  }

  getDestinationId(dto: CreateShipmentDto): { portId: string } {
    return { portId: dto.portId as string };
  }
}
