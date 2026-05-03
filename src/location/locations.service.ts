import { Injectable, NotFoundException } from '@nestjs/common';
import { SeaPort, Warehouse } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortDto } from './models/create-port.dto';
import { CreateWarehouseDto } from './models/create-warehouse.dto';
import { UpdatePortDto } from './models/update-port.dto';
import { UpdateWarehouseDto } from './models/update-warehouse.dto';

/**
 * Servicio de ubicaciones.
 * Agrupa el CRUD de Bodegas (logística terrestre) y Puertos (logística marítima)
 * en un solo servicio ya que comparten la misma naturaleza de "destino de entrega".
 *
 * findWarehouseById y findPortById son exportados para que
 * ShipmentsService los valide antes de crear un envío.
 */
@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  //Warehouses

  async createWarehouse(dto: CreateWarehouseDto): Promise<Warehouse> {
    return this.prisma.warehouse.create({ data: dto });
  }

  async findAllWarehouses(): Promise<Warehouse[]> {
    return this.prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
  }

  async findWarehouseById(id: string): Promise<Warehouse> {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });

    if (!warehouse) {
      throw new NotFoundException(`Bodega con id '${id}' no encontrada`);
    }

    return warehouse;
  }

  async updateWarehouse(
    id: string,
    dto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    await this.findWarehouseById(id);

    return this.prisma.warehouse.update({ where: { id }, data: dto });
  }

  async removeWarehouse(id: string): Promise<void> {
    await this.findWarehouseById(id);

    await this.prisma.warehouse.delete({ where: { id } });
  }

  // Seaports

  async createPort(dto: CreatePortDto): Promise<SeaPort> {
    return this.prisma.seaPort.create({ data: dto });
  }

  async findAllPorts(): Promise<SeaPort[]> {
    return this.prisma.seaPort.findMany({ orderBy: { name: 'asc' } });
  }

  async findPortById(id: string): Promise<SeaPort> {
    const port = await this.prisma.seaPort.findUnique({ where: { id } });

    if (!port) {
      throw new NotFoundException(`Puerto con id '${id}' no encontrado`);
    }

    return port;
  }

  async updatePort(id: string, dto: UpdatePortDto): Promise<SeaPort> {
    await this.findPortById(id);

    return this.prisma.seaPort.update({ where: { id }, data: dto });
  }

  async removePort(id: string): Promise<void> {
    await this.findPortById(id);

    await this.prisma.seaPort.delete({ where: { id } });
  }
}
