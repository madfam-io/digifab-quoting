import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { LoggerService } from '@/common/logger/logger.service';
import { 
  CacheEntry, 
  CacheKeyOptions, 
  CacheStatistics 
} from './interfaces/cache-options.interface';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly defaultTTL = 3600; // 1 hour default
  private statistics: CacheStatistics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    hitRate: 0,
    lastReset: new Date(),
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('redis.url');
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error', error);
      this.statistics.errors++;
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      // Continue without Redis - graceful degradation
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  /**
   * Generate a cache key with tenant isolation
   */
  generateKey(options: CacheKeyOptions): string {
    const parts = [options.prefix];
    
    if (options.tenantId) {
      parts.push(`tenant:${options.tenantId}`);
    }
    
    if (Array.isArray(options.identifier)) {
      parts.push(...options.identifier);
    } else {
      parts.push(options.identifier);
    }
    
    return parts.join(':');
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      
      if (!value) {
        this.statistics.misses++;
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(value);
      
      // Check if expired
      if (entry.metadata.expiresAt && entry.metadata.expiresAt < Date.now()) {
        await this.delete(key);
        this.statistics.misses++;
        return null;
      }

      this.statistics.hits++;
      this.updateHitRate();
      return entry.data;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}`, error);
      this.statistics.errors++;
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  async set<T>(
    key: string, 
    value: T, 
    ttl?: number,
    metadata?: Partial<CacheEntry['metadata']>
  ): Promise<boolean> {
    try {
      const entry: CacheEntry<T> = {
        data: value,
        metadata: {
          createdAt: Date.now(),
          expiresAt: ttl ? Date.now() + (ttl * 1000) : undefined,
          ...metadata,
        },
      };

      const serialized = JSON.stringify(entry);
      
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }

      this.statistics.sets++;
      return true;
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}`, error);
      this.statistics.errors++;
      return false;
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string | string[]): Promise<number> {
    try {
      const keys = Array.isArray(key) ? key : [key];
      const result = await this.client.del(...keys);
      this.statistics.deletes += result;
      return result;
    } catch (error) {
      this.logger.error(`Error deleting cache key(s) ${key}`, error);
      this.statistics.errors++;
      return 0;
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      
      return await this.delete(keys);
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}`, error);
      this.statistics.errors++;
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking cache key existence ${key}`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Error getting TTL for cache key ${key}`, error);
      return -1;
    }
  }

  /**
   * Extend TTL for a key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error setting expiry for cache key ${key}`, error);
      return false;
    }
  }

  /**
   * Flush all cache (use with caution)
   */
  async flushAll(): Promise<void> {
    try {
      await this.client.flushall();
      this.logger.warn('All cache flushed');
    } catch (error) {
      this.logger.error('Error flushing cache', error);
      this.statistics.errors++;
    }
  }

  /**
   * Flush cache for specific tenant
   */
  async flushTenant(tenantId: string): Promise<number> {
    return await this.deletePattern(`*:tenant:${tenantId}:*`);
  }

  /**
   * Get cache statistics
   */
  getStatistics(): CacheStatistics {
    return { ...this.statistics };
  }

  /**
   * Reset cache statistics
   */
  resetStatistics(): void {
    this.statistics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0,
      lastReset: new Date(),
    };
  }

  /**
   * Execute Redis command directly (for advanced use)
   */
  async execute<T = any>(command: string, ...args: any[]): Promise<T> {
    try {
      return await this.client.call(command, ...args);
    } catch (error) {
      this.logger.error(`Error executing Redis command ${command}`, error);
      this.statistics.errors++;
      throw error;
    }
  }

  /**
   * Get the Redis client instance
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  isConnected(): boolean {
    return this.client && this.client.status === 'ready';
  }

  private updateHitRate(): void {
    const total = this.statistics.hits + this.statistics.misses;
    this.statistics.hitRate = total > 0 ? (this.statistics.hits / total) * 100 : 0;
  }
}