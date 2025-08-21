import { SetMetadata } from '@nestjs/common';
import { CacheOptions } from '../interfaces/cache-options.interface';

export const CACHE_KEY_METADATA = 'cache_key_metadata';
export const CACHE_OPTIONS_METADATA = 'cache_options_metadata';
export const CACHE_INVALIDATE_METADATA = 'cache_invalidate_metadata';

/**
 * Decorator to cache method results
 * @param options Cache options
 */
export const Cacheable = (options?: CacheOptions): MethodDecorator => {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_OPTIONS_METADATA, options || {})(target, propertyKey, descriptor);
    
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheService = this.cacheService || this.cache;
      const tenantContext = this.tenantContext;
      
      if (!cacheService) {
        // No cache service available, execute method normally
        return originalMethod.apply(this, args);
      }

      // Generate cache key
      const keyPrefix = options?.prefix || `${target.constructor.name}:${String(propertyKey)}`;
      const keyGenerator = options?.keyGenerator || defaultKeyGenerator;
      const cacheKey = keyGenerator(keyPrefix, ...args);
      
      // Check condition
      if (options?.condition && !options.condition(...args)) {
        return originalMethod.apply(this, args);
      }

      // Apply cache-aside pattern
      return await cacheService.getOrSet({
        key: cacheKey,
        ttl: options?.ttl,
        fetchFn: () => originalMethod.apply(this, args),
        tenantSpecific: true,
      });
    };

    return descriptor;
  };
};

/**
 * Decorator to invalidate cache
 * @param patterns Cache key patterns to invalidate
 */
export const CacheInvalidate = (patterns: string | string[]): MethodDecorator => {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_INVALIDATE_METADATA, patterns)(target, propertyKey, descriptor);
    
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      const cacheService = this.cacheService || this.cache;
      if (cacheService) {
        // Invalidate cache after successful execution
        await cacheService.invalidate(patterns);
      }
      
      return result;
    };

    return descriptor;
  };
};

/**
 * Decorator to put result in cache
 * @param options Cache options
 */
export const CachePut = (options?: CacheOptions): MethodDecorator => {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      const cacheService = this.cacheService || this.cache;
      if (cacheService && result !== null && result !== undefined) {
        const keyPrefix = options?.prefix || `${target.constructor.name}:${String(propertyKey)}`;
        const keyGenerator = options?.keyGenerator || defaultKeyGenerator;
        const cacheKey = keyGenerator(keyPrefix, ...args);
        
        await cacheService.redisService.set(
          cacheKey,
          result,
          options?.ttl,
          { tenantId: this.tenantContext?.getTenantId() }
        );
      }
      
      return result;
    };

    return descriptor;
  };
};

/**
 * Decorator to evict cache
 * @param patterns Cache key patterns to evict
 */
export const CacheEvict = (patterns: string | string[]): MethodDecorator => {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheService = this.cacheService || this.cache;
      if (cacheService) {
        // Evict cache before execution
        await cacheService.invalidate(patterns);
      }
      
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};

/**
 * Default key generator function
 */
function defaultKeyGenerator(prefix: string, ...args: any[]): string {
  const argKey = args
    .map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(arg, Object.keys(arg).sort());
      }
      return String(arg);
    })
    .join(':');
  
  return `${prefix}:${argKey}`;
}