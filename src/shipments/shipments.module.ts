import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ClientsModule } from '../clients/clients.module';
import { LocationsModule } from '../location/locations.module';
import { ProductsModule } from '../products/products.module';
import { SharedModule } from '../shared/shared.module';
import { ShipmentFactory } from './factory/shipment.factory';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { MaritimeShipmentStrategy } from './strategies/maritime-shipment.strategy';
import { LandShipmentStrategy } from './strategies/land-shipment.strategy';
import { ShipmentProcessor } from './processors/shipment.processor';

@Module({
  imports: [
    SharedModule,
    ClientsModule,
    ProductsModule,
    LocationsModule,
    BullModule.registerQueue({
      name: 'shipments',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      },
    }),
  ],
  controllers: [ShipmentsController],
  providers: [
    LandShipmentStrategy,
    MaritimeShipmentStrategy,
    ShipmentFactory,
    ShipmentsService,
    ShipmentProcessor,
  ],
})
export class ShipmentsModule {}
