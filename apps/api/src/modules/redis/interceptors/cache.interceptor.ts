import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../cache.service';
import { CACHE_OPTIONS_METADATA } from '../decorators/cache.decorator';
import { CacheOptions } from '../interfaces/cache-options.interface';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const options = this.reflector.get<CacheOptions>(
      CACHE_OPTIONS_METADATA,
      context.getHandler(),
    );

    if (!options) {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(context, options);

    // Try to get from cache
    const cached = await this.cacheService.get(cacheKey);
    if (cached !== null) {
      return of(cached);
    }

    // Execute handler and cache result
    return next.handle().pipe(
      tap(async (data) => {
        if (data !== null && data !== undefined) {
          await this.cacheService.set(
            cacheKey,
            data,
            options.ttl,
          );
        }
      }),
    );
  }

  private generateCacheKey(
    context: ExecutionContext,
    options: CacheOptions,
  ): string {
    const request = context.switchToHttp().getRequest();
    const className = context.getClass().name;
    const methodName = context.getHandler().name;

    if (options.key) {
      return options.key;
    }

    if (options.keyGenerator) {
      return options.keyGenerator(request);
    }

    // Default key generation
    const parts = [
      options.prefix || `${className}:${methodName}`,
      request.method,
      request.url,
    ];

    // Add query params if present
    if (request.query && Object.keys(request.query).length > 0) {
      parts.push(JSON.stringify(request.query));
    }

    // Add body hash for POST/PUT requests
    if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      parts.push(JSON.stringify(request.body));
    }

    return parts.join(':');
  }
}