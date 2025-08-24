import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { RateLimitExceededException } from '../exceptions/business.exceptions';
import { RedisService } from '../../modules/redis/redis.service';
import { LoggerService } from '../logger/logger.service';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response) => void;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
  remaining: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly configs = new Map<string, RateLimitConfig>();

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.setupDefaultConfigs();
  }

  private setupDefaultConfigs() {
    // Global rate limit
    this.configs.set('global', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: this.configService.get('RATE_LIMIT_GLOBAL', 1000),
      keyGenerator: (req) => this.getClientIdentifier(req),
    });

    // API rate limit (more restrictive)
    this.configs.set('api', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: this.configService.get('RATE_LIMIT_API', 100),
      keyGenerator: (req) => `api:${this.getClientIdentifier(req)}`,
    });

    // Auth endpoints (very restrictive)
    this.configs.set('auth', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: this.configService.get('RATE_LIMIT_AUTH', 5),
      keyGenerator: (req) => `auth:${this.getClientIdentifier(req)}`,
    });

    // File upload (moderate)
    this.configs.set('upload', {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: this.configService.get('RATE_LIMIT_UPLOAD', 10),
      keyGenerator: (req) => `upload:${this.getClientIdentifier(req)}`,
    });

    // Guest endpoints (moderate)
    this.configs.set('guest', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: this.configService.get('RATE_LIMIT_GUEST', 50),
      keyGenerator: (req) => `guest:${this.getClientIdentifier(req)}`,
    });
  }

  createRateLimiter(configName: string = 'global') {
    return async (req: Request, res: Response, next: NextFunction) => {
      const config = this.configs.get(configName);
      if (!config) {
        this.logger.warn(`Rate limit config '${configName}' not found`);
        return next();
      }

      try {
        const key = config.keyGenerator!(req);
        const rateLimitInfo = await this.checkRateLimit(key, config);

        // Set rate limit headers
        res.setHeader('X-Rate-Limit-Limit', config.maxRequests);
        res.setHeader('X-Rate-Limit-Remaining', Math.max(0, rateLimitInfo.remaining));
        res.setHeader('X-Rate-Limit-Reset', rateLimitInfo.resetTime);

        if (rateLimitInfo.remaining < 0) {
          // Rate limit exceeded
          const retryAfter = Math.ceil((rateLimitInfo.resetTime - Date.now()) / 1000);
          res.setHeader('Retry-After', retryAfter);
          
          this.logger.warn(`Rate limit exceeded for ${key}`, {
            config: configName,
            count: rateLimitInfo.count,
            limit: config.maxRequests,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
          });

          if (config.onLimitReached) {
            config.onLimitReached(req, res);
          }

          throw new RateLimitExceededException(
            config.maxRequests,
            Math.floor(config.windowMs / 1000),
            retryAfter,
          );
        }

        next();
      } catch (error) {
        if (error instanceof RateLimitExceededException) {
          throw error;
        }
        
        this.logger.error('Rate limiting error', error as any);
        next(); // Continue on Redis errors
      }
    };
  }

  async checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitInfo> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const resetTime = now + config.windowMs;

    // Use Redis sorted set to track requests with timestamps
    const pipe = this.redisService.client.pipeline();
    
    // Remove old entries
    pipe.zremrangebyscore(key, '-inf', windowStart);
    
    // Add current request
    pipe.zadd(key, now, `${now}-${Math.random()}`);
    
    // Get current count
    pipe.zcard(key);
    
    // Set expiry
    pipe.expire(key, Math.ceil(config.windowMs / 1000));

    const results = await pipe.exec();
    const count = results?.[2]?.[1] as number || 0;
    
    return {
      count,
      resetTime,
      remaining: config.maxRequests - count,
    };
  }

  private getClientIdentifier(req: Request): string {
    // Try to get user ID first (for authenticated requests)
    const userId = (req as any).user?.id;
    if (userId) {
      return `user:${userId}`;
    }

    // Try to get tenant ID
    const tenantId = req.headers['x-tenant-id'] as string;
    if (tenantId) {
      return `tenant:${tenantId}`;
    }

    // Fall back to IP address
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.connection.remoteAddress;
    return `ip:${ip}`;
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Apply global rate limiting by default
    return this.createRateLimiter('global')(req, res, next);
  }

  // Static methods for easy use in controllers
  static global() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      // This would be implemented as a decorator
    };
  }

  static api() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      // This would be implemented as a decorator
    };
  }

  static auth() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      // This would be implemented as a decorator
    };
  }

  async getStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};
    
    for (const [configName] of this.configs) {
      try {
        const pattern = `${configName}:*`;
        const keys = await this.redisService.client.keys(pattern);
        stats[configName] = {
          activeKeys: keys.length,
          config: this.configs.get(configName),
        };
      } catch (error) {
        this.logger.error(`Error getting stats for ${configName}`, error as any);
        stats[configName] = { error: 'Failed to get stats' };
      }
    }
    
    return stats;
  }
}