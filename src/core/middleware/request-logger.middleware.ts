import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * Middleware de logging de requests.
 * Registra el método, URL y body de cada request entrante.
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Request');

  use(req: Request, _res: Response, next: NextFunction): void {
    const { method, originalUrl, body } = req;

    const sanitizedBody = this.sanitizeBody(body as Record<string, unknown>);

    this.logger.debug(
      `[${method}] ${originalUrl} — body: ${JSON.stringify(sanitizedBody)}`,
    );

    next();
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body || typeof body !== 'object') return {};

    const sensitiveFields = ['password', 'token', 'secret'];
    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }
}
