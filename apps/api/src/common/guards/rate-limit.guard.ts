import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  constructor(private reflector: Reflector) {
    super(
      {
        ttl: 60,
        limit: 100,
      },
      {
        ignoreUserAgents: [/googlebot/i, /bingbot/i],
      },
      reflector,
    );
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use combination of IP and tenant ID for rate limiting
    const ip = req.ip || req.connection.remoteAddress;
    const tenantId = req.headers['x-tenant-id'] || 'default';
    const userId = req.user?.id || 'anonymous';

    // Different rate limit buckets for authenticated vs anonymous users
    if (req.user) {
      return `${tenantId}:${userId}`;
    }

    return `${tenantId}:${ip}`;
  }

  protected throwThrottlingException(context: ExecutionContext): void {
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests. Please try again later.',
        error: 'Too Many Requests',
        retryAfter: 60,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
