export interface CacheOptions {
  key?: string;
  ttl?: number; // Time to live in seconds
  prefix?: string;
  invalidateOn?: string[]; // Event names that invalidate this cache
  condition?: (...args: any[]) => boolean; // Condition to cache
  keyGenerator?: (...args: any[]) => string; // Custom key generation
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

export interface CacheEntry<T = any> {
  data: T;
  metadata: {
    createdAt: number;
    expiresAt?: number;
    tenantId?: string;
    version?: string;
  };
}