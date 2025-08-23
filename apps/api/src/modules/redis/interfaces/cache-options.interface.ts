export interface CacheOptions {
  key?: string;
  ttl?: number; // Time to live in seconds
  prefix?: string;
  invalidateOn?: string[]; // Event names that invalidate this cache
  condition?: (...args: unknown[]) => boolean; // Condition to cache
  keyGenerator?: (prefix: string, ...args: unknown[]) => string; // Custom key generation
}

export interface CacheKeyOptions {
  prefix: string;
  identifier: string | string[];
  tenantId?: string;
}

export interface CacheStatistics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
  lastReset: Date;
}

export interface CacheEntry<T = unknown> {
  data: T;
  metadata: {
    createdAt: number;
    expiresAt?: number;
    tenantId?: string;
    version?: string;
  };
}

export interface CacheContext {
  cacheService?: CacheService;
  cache?: CacheService;
  tenantContext?: {
    getTenantId(): string | undefined;
  };
  redisService?: {
    set(key: string, value: unknown, ttl?: number, options?: { tenantId?: string }): Promise<void>;
  };
}

export interface CacheService {
  getOrSet<T>(options: {
    key: string;
    ttl?: number;
    fetchFn: () => Promise<T> | T;
    tenantSpecific?: boolean;
  }): Promise<T>;
  invalidate(patterns: string | string[]): Promise<void>;
  redisService: {
    set(key: string, value: unknown, ttl?: number, options?: { tenantId?: string }): Promise<void>;
  };
}

export interface CacheableTarget {
  constructor: {
    name: string;
  };
}

export interface CacheableDescriptor extends PropertyDescriptor {
  value?: (...args: unknown[]) => unknown;
}
