import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../core/decorators/roles.decorator';
import { CreateShipmentDto } from './models/create-shipment.dto';
import { UpdateShipmentDto } from './models/update-shipment.dto';
import { ShipmentResponse } from './models/shipment-response.type';
import { ShipmentsService } from './shipments.service';

@ApiBearerAuth()
@ApiTags('Shipments')
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un envío terrestre o marítimo' })
  @ApiResponse({ status: 201, description: 'Envío creado exitosamente' })
  @ApiResponse({
    status: 202,
    description:
      'Envío encolado para procesamiento en background (>100 unidades)',
  })
  @ApiResponse({
    status: 400,
    description: 'Campos inválidos o reglas de negocio violadas',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente, producto, bodega o puerto no encontrado',
  })
  @ApiResponse({ status: 409, description: 'Número de guía ya registrado' })
  create(
    @Body() dto: CreateShipmentDto,
  ): Promise<ShipmentResponse | { jobId: string; message: string }> {
    return this.shipmentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los envíos' })
  @ApiResponse({ status: 200, description: 'Lista de envíos con relaciones' })
  findAll(): Promise<ShipmentResponse[]> {
    return this.shipmentsService.findAll();
  }

  @Get('next-tracking-number')
  @ApiOperation({ summary: 'Obtener el siguiente número de guía disponible' })
  @ApiResponse({ status: 200, description: 'Siguiente número de guía' })
  getNextTrackingNumber(): Promise<{ trackingNumber: string }> {
    return this.shipmentsService
      .getNextTrackingNumber()
      .then((trackingNumber) => ({ trackingNumber }));
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Listar envíos de un cliente específico' })
  @ApiResponse({ status: 200, description: 'Envíos del cliente' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findByClient(
    @Param('clientId') clientId: string,
  ): Promise<ShipmentResponse[]> {
    return this.shipmentsService.findByClient(clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un envío por ID' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado' })
  findOne(@Param('id') id: string): Promise<ShipmentResponse> {
    return this.shipmentsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un envío' })
  @ApiResponse({ status: 200, description: 'Envío actualizado' })
  @ApiResponse({
    status: 400,
    description: 'El envío ya está completado y no puede ser modificado',
  })
  @ApiResponse({ status: 404, description: 'Envío no encontrado' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentDto,
  ): Promise<ShipmentResponse> {
    return this.shipmentsService.update(id, dto);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Rechazar un envío' })
  @ApiResponse({ status: 200, description: 'Envío rechazado' })
  @ApiResponse({ status: 400, description: 'El envío ya está rechazado' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado' })
  reject(@Param('id') id: string): Promise<ShipmentResponse> {
    return this.shipmentsService.reject(id);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un envío [admin]' })
  @ApiResponse({ status: 204, description: 'Envío eliminado' })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.shipmentsService.remove(id);
  }
}
