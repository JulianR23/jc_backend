import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

/**
 * Decorador @CurrentUser()
 * Extrae el usuario autenticado del request.
 * Se usa en controladores para acceder al usuario sin tocar el request manualmente.
 *
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: JwtPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: unknown }>();
    return request.user;
  },
);
