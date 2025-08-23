import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { RedisService } from './redis.service';
import { TenantContextService } from '@/modules/tenant/tenant-context.service';
import { LoggerService } from '@/common/logger/logger.service';

export interface CacheAsideOptions<T> {
  key: string;
  ttl?: number;
  fetchFn: () => Promise<T>;
  tenantSpecific?: boolean;
  version?: string;
}

@Injectable()
export class CacheService {
  constructor(
    private readonly redisService: RedisService,
    private readonly tenantContext: TenantContextService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Cache-aside pattern implementation
   */
  async getOrSet<T>(options: CacheAsideOptions<T>): Promise<T> {
    const cacheKey = this.buildKey(options.key, options.tenantSpecific);

    // Try to get from cache
    const cached = await this.redisService.get<T>(cacheKey);
    if (cached !== null) {
      this.logger.debug(`Cache hit for key: ${cacheKey}`);
      return cached;
    }

    // Cache miss - fetch data
    this.logger.debug(`Cache miss for key: ${cacheKey}`);
    const data = await options.fetchFn();

    // Store in cache
    let tenantId: string | undefined;
    if (options.tenantSpecific) {
      try {
        tenantId = this.tenantContext.getTenantId();
      } catch (error) {
        // No tenant context available
      }
    }

    const metadata = {
      tenantId,
      version: options.version,
    };

    await this.redisService.set(cacheKey, data, options.ttl, metadata);

    return data;
  }

  /**
   * Invalidate cache entries
   */
  async invalidate(patterns: string | string[]): Promise<number> {
    const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
    let totalDeleted = 0;

    for (const pattern of patternsArray) {
      const fullPattern = this.buildKey(pattern, true);
      const deleted = await this.redisService.deletePattern(fullPattern);
      totalDeleted += deleted;
    }

    this.logger.log(`Invalidated ${totalDeleted} cache entries`);
    return totalDeleted;
  }

  /**
   * Generate cache key for quote calculations
   */
  generateQuoteKey(fileHash: string, configuration: any): string {
    const configHash = this.hashObject(configuration);
    return this.buildKey(`quote:${fileHash}:${configHash}`, true);
  }

  /**
   * Cache pricing rules with TTL
   */
  async cachePricingRules(
    service: string,
    material: string,
    rules: any,
    ttl = 3600, // 1 hour default
  ): Promise<void> {
    const key = this.buildKey(`pricing:rules:${service}:${material}`, true);
    await this.redisService.set(key, rules, ttl);
  }

  /**
   * Get cached pricing rules
   */
  async getCachedPricingRules(service: string, material: string): Promise<any | null> {
    const key = this.buildKey(`pricing:rules:${service}:${material}`, true);
    return await this.redisService.get(key);
  }

  /**
   * Cache tenant configuration
   */
  async cacheTenantConfig(config: any, ttl = 1800): Promise<void> {
    const tenantId = this.tenantContext.getTenantId();
    const key = `tenant:config:${tenantId}`;
    await this.redisService.set(key, config, ttl);
  }

  /**
   * Get cached tenant configuration
   */
  async getCachedTenantConfig(): Promise<any | null> {
    const tenantId = this.tenantContext.getTenantId();
    const key = `tenant:config:${tenantId}`;
    return await this.redisService.get(key);
  }

  /**
   * Invalidate tenant configuration cache
   */
  async invalidateTenantConfig(): Promise<void> {
    const tenantId = this.tenantContext.getTenantId();
    await this.redisService.delete(`tenant:config:${tenantId}`);
  }

  /**
   * Cache user session data
   */
  async cacheUserSession(
    userId: string,
    sessionData: any,
    ttl = 900, // 15 minutes
  ): Promise<void> {
    const key = this.buildKey(`session:${userId}`, true);
    await this.redisService.set(key, sessionData, ttl);
  }

  /**
   * Get cached user session
   */
  async getCachedUserSession(userId: string): Promise<any | null> {
    const key = this.buildKey(`session:${userId}`, true);
    return await this.redisService.get(key);
  }

  /**
   * Extend user session TTL
   */
  async extendUserSession(userId: string, ttl = 900): Promise<boolean> {
    const key = this.buildKey(`session:${userId}`, true);
    return await this.redisService.expire(key, ttl);
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    return await this.redisService.get<T>(key);
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number, metadata?: any): Promise<void> {
    await this.redisService.set(key, value, ttl, metadata);
  }

  /**
   * Cache quote calculation result
   */
  async cacheQuoteCalculation(
    fileHash: string,
    configuration: any,
    result: any,
    ttl = 3600, // 1 hour
  ): Promise<void> {
    const key = this.generateQuoteKey(fileHash, configuration);
    await this.redisService.set(key, result, ttl);
  }

  /**
   * Get cached quote calculation
   */
  async getCachedQuoteCalculation(fileHash: string, configuration: any): Promise<any | null> {
    const key = this.generateQuoteKey(fileHash, configuration);
    return await this.redisService.get(key);
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmUpCache(): Promise<void> {
    this.logger.log('Starting cache warm-up');

    try {
      // This method can be extended to pre-load frequently accessed data
      // For now, it's a placeholder for future implementation

      this.logger.log('Cache warm-up completed');
    } catch (error) {
      this.logger.error('Error during cache warm-up', error as any);
    }
  }

  /**
   * Get cache health status
   */
  async getHealthStatus() {
    const isConnected = this.redisService.isConnected();
    const statistics = this.redisService.getStatistics();

    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      connected: isConnected,
      statistics,
      uptime: Date.now() - statistics.lastReset.getTime(),
    };
  }

  /**
   * Build cache key with optional tenant isolation
   */
  private buildKey(key: string, tenantSpecific = false): string {
    if (tenantSpecific) {
      try {
        const tenantId = this.tenantContext.getTenantId();
        if (tenantId) {
          return `tenant:${tenantId}:${key}`;
        }
      } catch (error) {
        // No tenant context available, use key without tenant prefix
        this.logger.debug('No tenant context available for key building');
      }
    }
    return key;
  }

  /**
   * Generate hash for object (for cache key generation)
   */
  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    return createHash('md5').update(str).digest('hex').substring(0, 8);
  }
}
