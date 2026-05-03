import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './models/auth-response.type';
import { UsersService } from '../users/user.service';

/**
 * Estrategia JWT de Passport.
 * Extrae el Bearer token del header Authorization,
 * lo valida con el JWT_SECRET y retorna el payload.
 *
 * El resultado de validate() queda disponible como req.user
 * en cualquier controlador protegido.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return { sub: payload.sub, email: payload.email, name: payload.name, role: user.role };
  }
}
