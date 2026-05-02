import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/**
 * DTO para actualización parcial de producto.
 * Todos los campos son opcionales gracias a PartialType.
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
