import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO para el registro de un nuevo usuario.
 */
export class RegisterDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString({ message: 'El nombre debe ser texto' })
  name!: string;

  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}
