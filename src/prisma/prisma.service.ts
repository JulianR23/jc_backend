import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  /**
   * Abre la conexión a base de datos al inicializar el módulo.
   * @returns Promesa resuelta cuando Prisma queda conectado.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Cierra la conexión a base de datos al destruir el módulo.
   * @returns Promesa resuelta cuando Prisma se desconecta.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
