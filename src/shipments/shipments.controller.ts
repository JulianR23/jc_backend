import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateShipmentDto } from './models/create-shipment.dto';
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un envío' })
  @ApiResponse({ status: 204, description: 'Envío eliminado' })
  @ApiResponse({ status: 404, description: 'Envío no encontrado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.shipmentsService.remove(id);
  }
}
