import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreatePortDto {
  @ApiProperty({ example: 'Puerto de Cartagena' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name!: string;

  @ApiProperty({ example: 'Manga, Cartagena' })
  @IsString()
  address!: string;

  @ApiProperty({ example: 'Cartagena' })
  @IsString()
  city!: string;

  @ApiProperty({ example: 'Colombia' })
  @IsString()
  country!: string;
}
