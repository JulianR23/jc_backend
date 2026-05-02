import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

/**
 * DTO para cada ítem dentro de un envío.
 * Un envío puede tener múltiples ítems (productos con cantidades).
 * La suma de todos los quantity = Shipment.totalUnits.
 *
 * Regla de negocio: quantity debe ser mayor que 0 (Min(1)).
 */
export class ShipmentItemDto {
  @ApiProperty({ example: 'uuid-del-producto' })
  @IsUUID('4', { message: 'productId debe ser un UUID válido' })
  productId!: string;

  @ApiProperty({ example: 5, minimum: 1 })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser mayor que 0' })
  quantity!: number;
}
