import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

const GUIDE_NUMBER_REGEX = /^[A-Z0-9]{10}$/;

/**
 * Validador personalizado para número de guía.
 * Formato requerido: exactamente 10 caracteres alfanuméricos en mayúsculas.
 * Ej: AB12345678
 *
 * La unicidad del campo se garantiza a nivel de BD (unique en schema.prisma)
 * y el GlobalExceptionFilter convierte el P2002 en 409 Conflict.
 */
@ValidatorConstraint({ name: 'isGuideNumber', async: false })
export class IsGuideNumberConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return GUIDE_NUMBER_REGEX.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} debe tener exactamente 10 caracteres alfanuméricos en mayúsculas (ej: AB12345678)`;
  }
}

/**
 * Decorador @IsGuideNumber()
 * Valida formato del número de guía — la unicidad la maneja Prisma.
 */
export const IsGuideNumber =
  (options?: ValidationOptions) =>
  (object: object, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsGuideNumberConstraint,
    });
  };
