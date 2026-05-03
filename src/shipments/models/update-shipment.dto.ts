import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { IsFleetNumber } from '../../shared/fleet-number.validator';
import { IsVehiclePlate } from '../../shared/plate.validator';

export class UpdateShipmentDto {
  @ApiPropertyOptional({ example: '2025-06-01' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de entrega debe ser una fecha válida' })
  deliveryAt?: string;

  @ApiPropertyOptional({ example: 'ABC123' })
  @Transform(({ value }) => value || undefined)
  @IsOptional()
  @IsVehiclePlate()
  vehiclePlate?: string;

  @ApiPropertyOptional({ example: 'uuid-de-la-bodega' })
  @Transform(({ value }) => value || undefined)
  @IsOptional()
  @IsUUID('4', { message: 'warehouseId debe ser un UUID válido' })
  warehouseId?: string;

  @ApiPropertyOptional({ example: 'ABC1234D' })
  @Transform(({ value }) => value || undefined)
  @IsOptional()
  @IsFleetNumber()
  fleetNumber?: string;

  @ApiPropertyOptional({ example: 'uuid-del-puerto' })
  @Transform(({ value }) => value || undefined)
  @IsOptional()
  @IsUUID('4', { message: 'portId debe ser un UUID válido' })
  portId?: string;
}
