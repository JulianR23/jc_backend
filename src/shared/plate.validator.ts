import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

const PLATE_REGEX = /^[A-Z]{3}\d{3}$/;

/**
 * Validador personalizado para placa de camión.
 * Formato requerido: 3 letras mayúsculas + 3 números. Ej: AAA123
 */
@ValidatorConstraint({ name: 'isVehiclePlate', async: false })
export class IsVehiclePlateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return PLATE_REGEX.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} debe tener el formato AAA123 (3 letras mayúsculas + 3 números)`;
  }
}

/**
 * Decorador @IsVehiclePlate()
 * Valida que el valor cumpla con el formato de placa AAA123.
 *
 * @example
 * @IsVehiclePlate()
 * vehiclePlate: string;
 */
export const IsVehiclePlate =
  (options?: ValidationOptions) =>
  (object: object, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsVehiclePlateConstraint,
    });
  };
