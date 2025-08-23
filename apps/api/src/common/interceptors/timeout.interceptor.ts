import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly defaultTimeout = 30000; // 30 seconds

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const timeoutDuration = this.getTimeout(request);

    return next.handle().pipe(
      timeout(timeoutDuration),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException('Request timeout'));
        }
        return throwError(() => err);
      }),
    );
  }

  private getTimeout(request: any): number {
    // File upload endpoints get longer timeout
    if (request.url?.includes('/upload')) {
      return 300000; // 5 minutes
    }

    // Geometry analysis endpoints get longer timeout
    if (request.url?.includes('/analyze') || request.url?.includes('/worker')) {
      return 120000; // 2 minutes
    }

    // Admin operations get longer timeout
    if (request.url?.includes('/admin')) {
      return 60000; // 1 minute
    }

    return this.defaultTimeout;
  }
}