import { BadRequestException, Injectable } from '@nestjs/common';
import { LogisticType } from '../models/create-shipment.dto';
import { MaritimeShipmentStrategy } from '../strategies/maritime-shipment.strategy';
import { ShipmentStrategy } from '../strategies/shipment-strategy.interface';
import { LandShipmentStrategy } from '../strategies/land-shipment.strategy';

/**
 * ShipmentFactory — Factory Method Pattern.
 *
 * Decide en tiempo de ejecución qué estrategia instanciar
 * según el LogisticType recibido en el DTO.
 *
 * Al combinarlo con Strategy, el ShipmentsService no necesita
 * conocer las diferencias entre logística terrestre y marítima simplemente llama a la estrategia que retorna la factory.
 */
@Injectable()
export class ShipmentFactory {
  constructor(
    private readonly landStrategy: LandShipmentStrategy,
    private readonly maritimeStrategy: MaritimeShipmentStrategy,
  ) {}

  createStrategy(logisticType: LogisticType): ShipmentStrategy {
    const strategies: Record<LogisticType, ShipmentStrategy> = {
      [LogisticType.LAND]: this.landStrategy,
      [LogisticType.MARITIME]: this.maritimeStrategy,
    };

    const strategy = strategies[logisticType];

    if (!strategy) {
      throw new BadRequestException(
        `Tipo de logística no soportado: ${logisticType}`,
      );
    }

    return strategy;
  }
}
