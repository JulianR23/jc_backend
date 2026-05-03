import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/user.service';
import { AuthResponse, JwtPayload } from './models/auth-response.type';
import { LoginDto } from './models/login.dto';
import { RegisterDto } from './models/register.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          companyName: dto.name,
          email: dto.email,
          phone: dto.phone,
          documentId: dto.nit,
        },
      });

      return tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          customerId: customer.id,
        },
      });
    });

    return this.buildAuthResponse(user);
  }

  /**
   * Valida credenciales y genera la respuesta de autenticación.
   * @param dto Credenciales de acceso del usuario.
   * @returns Token de acceso y datos públicos del usuario autenticado.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.buildAuthResponse(user);
  }

  /**
   * Construye el payload JWT y el objeto de respuesta de autenticación.
   * @param user Usuario autenticado con campos mínimos requeridos.
   * @returns Estructura estándar con token y datos del usuario.
   */
  private buildAuthResponse(user: {
    id: string;
    name: string;
    email: string;
  }): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
