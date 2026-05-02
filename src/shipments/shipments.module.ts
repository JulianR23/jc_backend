import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { LocationsModule } from '../location/locations.module';
import { ProductsModule } from '../products/products.module';
import { SharedModule } from '../shared/shared.module';
import { ShipmentFactory } from './factory/shipment.factory';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { MaritimeShipmentStrategy } from './strategies/maritime-shipment.strategy';
import { LandShipmentStrategy } from './strategies/land-shipment.strategy';

@Module({
  imports: [SharedModule, ClientsModule, ProductsModule, LocationsModule],
  controllers: [ShipmentsController],
  providers: [
    LandShipmentStrategy,
    MaritimeShipmentStrategy,
    ShipmentFactory,
    ShipmentsService,
  ],
})
export class ShipmentsModule {}
