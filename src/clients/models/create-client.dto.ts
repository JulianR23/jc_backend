import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO para crear un cliente.
 * El email y documento son únicos — Prisma lanzará P2002 si ya existen,
 * el GlobalExceptionFilter lo convierte en 409 Conflict automáticamente.
 */
export class CreateClientDto {
  @ApiProperty({ example: 'Logistics SA' })
  @IsString({ message: 'La empresa debe ser texto' })
  @MinLength(2, { message: 'La empresa debe tener al menos 2 caracteres' })
  companyName!: string;

  @ApiProperty({ example: 'juan@email.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @ApiProperty({ example: '3001234567' })
  @IsString({ message: 'El teléfono debe ser texto' })
  phone!: string;

  @ApiProperty({ example: '123456789' })
  @IsString({ message: 'El documento debe ser texto' })
  documentId!: string;
}
