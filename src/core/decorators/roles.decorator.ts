import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorador @Roles(...roles)
 * Define qué roles tienen acceso a un endpoint. Trabaja en conjunto con RolesGuard.
 *
 * @example
 * @Roles('admin')
 * @Delete(':id')
 * remove(@Param('id') id: string) { ... }
 */
export const Roles = (...roles: string[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);
