import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
