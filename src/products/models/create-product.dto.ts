import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Electrónicos' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name!: string;

  @ApiProperty({ example: 'Tech' })
  @IsString({ message: 'El tipo de producto debe ser texto' })
  typeProduct!: string;

  @ApiPropertyOptional({ example: 'Dispositivos electrónicos y accesorios' })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  description?: string;

  @ApiProperty({ example: 'SKU12345' })
  @IsString({ message: 'El sku debe ser texto' })
  sku!: string;
}
