import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export enum LogisticType {
  LAND = 'LAND',
  MARITIME = 'MARITIME',
}

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { IsFleetNumber } from '../../shared/fleet-number.validator';
import { IsGuideNumber } from '../../shared/guide-number.validator';
import { IsVehiclePlate } from '../../shared/plate.validator';
import { ShipmentItemDto } from './shipment-item.dto';

/**
 * DTO para crear un envío.
 *
 * Validaciones en el DTO:
 * - guideNumber: 10 alfanuméricos mayúsculas (@IsGuideNumber)
 * - vehiclePlate: formato AAA123 (@IsVehiclePlate) — solo si es LAND
 * - fleetNumber: formato AAA1234A (@IsFleetNumber) — solo si es MARITIME
 * - items: mínimo 1 ítem, cada uno con quantity > 0
 *
 */
export class CreateShipmentDto {
  @ApiProperty({ example: 'AB12345678' })
  @IsGuideNumber()
  guideNumber!: string;

  @ApiProperty({ enum: LogisticType, example: LogisticType.LAND })
  @IsEnum(LogisticType, {
    message: `logisticType debe ser: ${Object.values(LogisticType).join(' | ')}`,
  })
  logisticType!: LogisticType;

  @ApiProperty({ example: 'uuid-del-cliente' })
  @IsUUID('8', { message: 'clientId debe ser un UUID válido' })
  clientId!: string;

  @ApiProperty({ example: 150000.0 })
  @IsNumber({}, { message: 'El precio base debe ser un número' })
  @IsPositive({ message: 'El precio base debe ser mayor que 0' })
  basePrice!: number;

  @ApiProperty({ example: '2025-06-01' })
  @IsDateString(
    {},
    { message: 'La fecha de entrega debe ser una fecha válida' },
  )
  deliveryAt!: string;

  @ApiProperty({ type: [ShipmentItemDto], minItems: 1 })
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'El envío debe tener al menos un producto' })
  @Type(() => ShipmentItemDto)
  items!: ShipmentItemDto[];

  //Campos exclusivos logística TERRESTRE

  @ApiPropertyOptional({ example: 'ABC123' })
  @IsOptional()
  @IsVehiclePlate()
  vehiclePlate?: string;

  @ApiPropertyOptional({ example: 'uuid-de-la-bodega' })
  @IsOptional()
  @IsUUID('4', { message: 'warehouseId debe ser un UUID válido' })
  warehouseId?: string;

  //Campos exclusivos logística MARÍTIMA

  @ApiPropertyOptional({ example: 'ABC1234D' })
  @IsOptional()
  @IsFleetNumber()
  fleetNumber?: string;

  @ApiPropertyOptional({ example: 'uuid-del-puerto' })
  @IsOptional()
  @IsUUID('4', { message: 'portId debe ser un UUID válido' })
  portId?: string;
}
