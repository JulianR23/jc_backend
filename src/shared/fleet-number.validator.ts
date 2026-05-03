import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

const FLEET_REGEX = /^[A-Z]{3}\d{4}[A-Z]$/;

/**
 * Validador personalizado para número de flota marítima.
 * Formato requerido: 3 letras + 4 números + 1 letra. Ej: AAA1234A
 */
@ValidatorConstraint({ name: 'isFleetNumber', async: false })
export class IsFleetNumberConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return FLEET_REGEX.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} debe tener el formato AAA1234A (3 letras + 4 números + 1 letra)`;
  }
}

/**
 * Decorador @IsFleetNumber()
 * Valida que el valor cumpla con el formato de flota AAA1234A.
 *
 * @example
 * @IsFleetNumber()
 * fleetNumber: string;
 */
export const IsFleetNumber =
  (options?: ValidationOptions) =>
  (object: object, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsFleetNumberConstraint,
    });
  };
