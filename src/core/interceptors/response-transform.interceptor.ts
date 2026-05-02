import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface StandardResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Interceptor de transformación de respuestas.
 * Envuelve cualquier respuesta exitosa en el formato estándar:
 * { statusCode, message, data, timestamp }
 *
 * Esto garantiza que todas las respuestas de la API tengan la misma estructura, independientemente del controlador.
 */
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T>> {
    const statusCode = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>().statusCode;

    return next.handle().pipe(
      map((data) => ({
        statusCode,
        message: 'OK',
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
