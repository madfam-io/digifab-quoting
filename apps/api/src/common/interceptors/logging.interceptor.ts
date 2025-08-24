import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { TenantContextService, TenantContext } from '../../modules/tenant/tenant-context.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly tenantContext: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Try to get context, but don't fail if it's not available
    let tenantContext: TenantContext | undefined;
    try {
      tenantContext = this.tenantContext.getContext();
    } catch (error) {
      // No context available
      tenantContext = undefined;
    }

    const { method, url, body, query, params } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip;
    const now = Date.now();

    // Log request
    this.logger.log(`${method} ${url} - Request`, {
      tenantId: tenantContext?.tenantId,
      userId: tenantContext?.userId,
      requestId: tenantContext?.requestId,
      ip,
      userAgent,
      body: this.sanitizeBody(body),
      query,
      params,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - now;
          const { statusCode } = response;

          // Log successful response
          this.logger.log(`${method} ${url} - ${statusCode} - ${responseTime}ms`, {
            tenantId: tenantContext?.tenantId,
            userId: tenantContext?.userId,
            requestId: tenantContext?.requestId,
            responseTime,
            responseSize: data ? JSON.stringify(data).length : 0,
          });
        },
        error: (error) => {
          const responseTime = Date.now() - now;

          // Error logging is handled by AllExceptionsFilter
          // This is just for tracking response time
          this.logger.error(`${method} ${url} - ${error.status || 500} - ${responseTime}ms`, {
            tenantId: tenantContext?.tenantId,
            userId: tenantContext?.userId,
            requestId: tenantContext?.requestId,
            responseTime,
            error: error.message,
          });
        },
      }),
    );
  }

  private sanitizeBody<T extends Record<string, unknown>>(body: T): T {
    if (!body) return body;

    const sensitiveFields = [
      'password',
      'passwordHash',
      'refreshToken',
      'accessToken',
      'apiKey',
      'secret',
      'token',
      'creditCard',
      'cvv',
    ];

    const sanitized = { ...body } as T;

    for (const field of sensitiveFields) {
      if (field in sanitized && sanitized[field as keyof T]) {
        (sanitized as Record<string, unknown>)[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
