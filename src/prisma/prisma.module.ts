import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

//Módulo global de Prisma.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
