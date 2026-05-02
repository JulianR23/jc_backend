import { Injectable, NotFoundException } from '@nestjs/common';
import { Customer } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './models/create-client.dto';
import { UpdateClientDto } from './models/update-client.dto';

/**
 * Servicio de clientes.
 * Maneja el CRUD completo del modelo Client.
 *
 * Regla de negocio: cada envío debe quedar relacionado a un cliente,
 * por lo tanto findById es usado también desde ShipmentsService
 * para validar que el cliente exista antes de crear un envío.
 */
@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto): Promise<Customer> {
    return this.prisma.customer.create({ data: dto });
  }

  async findAll(): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Customer> {
    const client = await this.prisma.customer.findUnique({ where: { id } });

    if (!client) {
      throw new NotFoundException(`Cliente con id '${id}' no encontrado`);
    }

    return client;
  }

  async update(id: string, dto: UpdateClientDto): Promise<Customer> {
    await this.findById(id);

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);

    await this.prisma.customer.delete({ where: { id } });
  }
}
