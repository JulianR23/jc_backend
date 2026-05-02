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
import { Customer } from '@prisma/client';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './models/create-client.dto';
import { UpdateClientDto } from './models/update-client.dto';

/**
 * Controlador de customeres.
 * Todas las rutas están protegidas con JWT
 */
@ApiBearerAuth()
@ApiTags('Customers')
@Controller('customers')
export class ClientsController {
  constructor(private readonly customersService: ClientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un customere' })
  @ApiResponse({ status: 201, description: 'Customere creado exitosamente' })
  @ApiResponse({ status: 409, description: 'Email o documento ya registrado' })
  create(@Body() dto: CreateClientDto): Promise<Customer> {
    return this.customersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los customeres' })
  @ApiResponse({ status: 200, description: 'Lista de customeres' })
  findAll(): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un customere por ID' })
  @ApiResponse({ status: 200, description: 'Customere encontrado' })
  @ApiResponse({ status: 404, description: 'Customere no encontrado' })
  findOne(@Param('id') id: string): Promise<Customer> {
    return this.customersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un customere' })
  @ApiResponse({ status: 200, description: 'Customere actualizado' })
  @ApiResponse({ status: 404, description: 'Customere no encontrado' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ): Promise<Customer> {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un customere' })
  @ApiResponse({ status: 204, description: 'Customere eliminado' })
  @ApiResponse({ status: 404, description: 'Customere no encontrado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.customersService.remove(id);
  }
}
