import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

/**
 * Módulo de clientes.
 * Exporta ClientsService para que ShipmentsModule pueda
 * validar la existencia del cliente antes de crear un envío.
 */
@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
