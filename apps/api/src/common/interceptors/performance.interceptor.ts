import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('Performance');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;

        // Log slow requests (> 1 second)
        if (responseTime > 1000) {
          this.logger.warn(`Slow request detected: ${method} ${url}`, {
            responseTime,
            threshold: 1000,
          });
        }

        // Log performance metrics
        this.logger.performance(`${method} ${url}`, responseTime, {
          method,
          url,
          userAgent: request.get('user-agent'),
        });
      }),
    );
  }
}
