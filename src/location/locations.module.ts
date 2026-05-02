import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { PortsController } from './ports.controller';
import { WarehousesController } from './warehouse.controller';

/**
 * Módulo de ubicaciones.
 * Agrupa bodegas y puertos bajo el mismo servicio ya que
 * comparten la misma lógica de "destino de entrega".
 */
@Module({
  controllers: [WarehousesController, PortsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
