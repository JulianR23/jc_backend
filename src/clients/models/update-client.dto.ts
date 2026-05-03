import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { CreateClientDto } from './create-client.dto';

/**
 * DTO para actualización parcial de cliente.
 * Extiende CreateClientDto con PartialType — todos los campos son opcionales.
 * Solo se actualizan los campos que lleguen en el body.
 */
export class UpdateClientDto extends PartialType(CreateClientDto) {
  @ApiPropertyOptional({ example: 'Logistics SA' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  companyName?: string;

  @ApiPropertyOptional({ example: 'juan@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  documentId?: string;
}
