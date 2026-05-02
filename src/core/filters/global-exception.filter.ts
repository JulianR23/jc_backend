import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

/**
 * Filtro global de excepciones.
 * Captura cualquier error lanzado en la aplicación y lo transforma en una respuesta HTTP con el formato estándar:
 * { statusCode, message, error, path, timestamp }
 *
 * Maneja tres tipos de errores:
 * 1. HttpException: errores controlados
 * 2. PrismaClientKnownRequestError: errores de base de datos conocidos
 * 3. Error genérico: cualquier error no esperado  500
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error } = this.resolveException(exception);

    this.logger.error(
      `[${request.method}] ${request.url} → ${statusCode}: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string;
    error: string;
  } {
    if (exception instanceof HttpException) {
      return this.resolveHttpException(exception);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrismaException(exception);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
      error: 'Internal Server Error',
    };
  }

  private resolveHttpException(exception: HttpException): {
    statusCode: number;
    message: string;
    error: string;
  } {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? Array.isArray((exceptionResponse as Record<string, unknown>).message)
          ? (
              (exceptionResponse as Record<string, unknown>).message as string[]
            ).join(', ')
          : String((exceptionResponse as Record<string, unknown>).message)
        : exception.message;

    return {
      statusCode,
      message,
      error: exception.name,
    };
  }

  private resolvePrismaException(
    exception: Prisma.PrismaClientKnownRequestError,
  ): {
    statusCode: number;
    message: string;
    error: string;
  } {
    // P2002 — Unique constraint violation
    if (exception.code === 'P2002') {
      const fields =
        (exception.meta?.target as string[])?.join(', ') ?? 'campo';
      return {
        statusCode: HttpStatus.CONFLICT,
        message: `El valor del campo '${fields}' ya existe`,
        error: 'Conflict',
      };
    }

    // P2025 — Record not found
    if (exception.code === 'P2025') {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'El registro no fue encontrado',
        error: 'Not Found',
      };
    }

    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Error en la base de datos',
      error: 'Database Error',
    };
  }
}
