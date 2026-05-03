import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString({ message: 'El nombre debe ser texto' })
  name!: string;

  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @ApiProperty({ example: '3001234567' })
  @IsString({ message: 'El teléfono debe ser texto' })
  @MaxLength(10, { message: 'El teléfono no puede tener más de 10 caracteres' })
  phone!: string;

  @ApiProperty({ example: '900123456-1' })
  @IsString({ message: 'El NIT debe ser texto' })
  @MaxLength(12, { message: 'El NIT no puede tener más de 12 caracteres' })
  nit!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}
