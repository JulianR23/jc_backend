import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Bodega Central Bogotá' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name!: string;

  @ApiProperty({ example: 'Calle 80 # 45-12' })
  @IsString()
  address!: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  city!: string;

  @ApiProperty({ example: 'Colombia', default: 'Colombia' })
  @IsString()
  country!: string;
}
