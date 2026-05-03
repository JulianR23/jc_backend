import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Warehouse } from '@prisma/client';
import { Roles } from '../core/decorators/roles.decorator';
import { LocationsService } from './locations.service';
import { CreateWarehouseDto } from './models/create-warehouse.dto';
import { UpdateWarehouseDto } from './models/update-warehouse.dto';

/**
 * Controlador de bodegas terrestres.
 * Las bodegas son el destino de entrega para la logística terrestre.
 */
@ApiBearerAuth()
@ApiTags('Warehouses')
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una bodega [admin]' })
  @ApiResponse({ status: 201, description: 'Bodega creada exitosamente' })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  create(@Body() dto: CreateWarehouseDto): Promise<Warehouse> {
    return this.locationsService.createWarehouse(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las bodegas' })
  findAll(): Promise<Warehouse[]> {
    return this.locationsService.findAllWarehouses();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una bodega por ID' })
  @ApiResponse({ status: 404, description: 'Bodega no encontrada' })
  findOne(@Param('id') id: string): Promise<Warehouse> {
    return this.locationsService.findWarehouseById(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar una bodega [admin]' })
  @ApiResponse({ status: 404, description: 'Bodega no encontrada' })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    return this.locationsService.updateWarehouse(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una bodega [admin]' })
  @ApiResponse({ status: 204, description: 'Bodega eliminada' })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  remove(@Param('id') id: string): Promise<void> {
    return this.locationsService.removeWarehouse(id);
  }
}
