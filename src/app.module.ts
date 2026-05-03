import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { CoreModule } from './core/core.module';
import { LocationsModule } from './location/locations.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { SharedModule } from './shared/shared.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { UsersModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV ?? 'development'}`,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    PrismaModule,
    CoreModule,
    SharedModule,
    UsersModule,
    AuthModule,
    ClientsModule,
    ProductsModule,
    LocationsModule,
    ShipmentsModule,
  ],
})
export class AppModule {}
