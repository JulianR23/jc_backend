import { Prisma } from '@prisma/client';
import { CreateShipmentDto } from '../models/create-shipment.dto';

/**
 * Resultado del cálculo de precio aplicado por cada estrategia.
 */
export type PriceCalculation = {
  readonly basePrice: Prisma.Decimal;
  readonly discount: Prisma.Decimal;
  readonly finalPrice: Prisma.Decimal;
};

/**
 * Interfaz ShipmentStrategy — Strategy Pattern.
 *
 * Define el contrato que toda estrategia de logística debe cumplir.
 * Cada estrategia encapsula las reglas de negocio específicas de su tipo de logística (terrestre o marítima):
 *
 * - calculatePrice: aplica la tasa de descuento correcta según el tipo
 * - validateFields: valida los campos exclusivos de cada tipo (placa para terrestre, número de flota para marítima)
 * - getDestinationId: retorna el ID de bodega o puerto según el tipo
 */
export interface ShipmentStrategy {
  calculatePrice(basePrice: number, totalUnits: number): PriceCalculation;
  validateFields(dto: CreateShipmentDto): void;
  getDestinationId(dto: CreateShipmentDto): {
    warehouseId?: string;
    portId?: string;
  };
}
