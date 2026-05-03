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
import { SeaPort as Port } from '@prisma/client';
import { Roles } from '../core/decorators/roles.decorator';
import { LocationsService } from './locations.service';
import { CreatePortDto } from './models/create-port.dto';
import { UpdatePortDto } from './models/update-port.dto';

/**
 * Controlador de puertos marítimos.
 * Los puertos son el destino de entrega para la logística marítima.
 */
@ApiBearerAuth()
@ApiTags('Ports')
@Controller('ports')
export class PortsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un puerto [admin]' })
  @ApiResponse({ status: 201, description: 'Puerto creado exitosamente' })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  create(@Body() dto: CreatePortDto): Promise<Port> {
    return this.locationsService.createPort(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los puertos' })
  findAll(): Promise<Port[]> {
    return this.locationsService.findAllPorts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un puerto por ID' })
  @ApiResponse({ status: 404, description: 'Puerto no encontrado' })
  findOne(@Param('id') id: string): Promise<Port> {
    return this.locationsService.findPortById(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar un puerto [admin]' })
  @ApiResponse({ status: 404, description: 'Puerto no encontrado' })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  update(@Param('id') id: string, @Body() dto: UpdatePortDto): Promise<Port> {
    return this.locationsService.updatePort(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un puerto [admin]' })
  @ApiResponse({ status: 204, description: 'Puerto eliminado' })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  remove(@Param('id') id: string): Promise<void> {
    return this.locationsService.removePort(id);
  }
}
