import { SetMetadata } from '@nestjs/common';
import { 
  CacheOptions, 
  CacheContext
} from '../interfaces/cache-options.interface';

export const CACHE_KEY_METADATA = 'cache_key_metadata';
export const CACHE_OPTIONS_METADATA = 'cache_options_metadata';
export const CACHE_INVALIDATE_METADATA = 'cache_invalidate_metadata';

/**
 * Decorator to cache method results
 * @param options Cache options
 */
export const Cacheable = (options?: CacheOptions): MethodDecorator => {
  return <T extends Function>(
    target: Object, 
    propertyKey: string | symbol, 
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> | void => {
    SetMetadata(CACHE_OPTIONS_METADATA, options || {})(target, propertyKey, descriptor);
    
    const originalMethod = descriptor.value as Function;
    
    if (!originalMethod) return descriptor;
    
    descriptor.value = async function (this: CacheContext, ...args: unknown[]) {
      const cacheService = this.cacheService || this.cache;
      
      if (!cacheService) {
        // No cache service available, execute method normally
        return originalMethod.apply(this, args);
      }

      // Generate cache key
      const keyPrefix = options?.prefix || `${(target.constructor as any).name}:${String(propertyKey)}`;
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
    } as any;

    return descriptor;
  };
};

/**
 * Decorator to invalidate cache
 * @param patterns Cache key patterns to invalidate
 */
export const CacheInvalidate = (patterns: string | string[]): MethodDecorator => {
  return <T extends Function>(
    target: Object, 
    propertyKey: string | symbol, 
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> | void => {
    SetMetadata(CACHE_INVALIDATE_METADATA, patterns)(target, propertyKey, descriptor);
    
    const originalMethod = descriptor.value as Function;
    
    if (!originalMethod) return descriptor;
    
    descriptor.value = async function (this: CacheContext, ...args: unknown[]) {
      const result = await originalMethod.apply(this, args);
      
      const cacheService = this.cacheService || this.cache;
      if (cacheService) {
        // Invalidate cache after successful execution
        await cacheService.invalidate(patterns);
      }
      
      return result;
    } as any;

    return descriptor;
  };
};

/**
 * Decorator to put result in cache
 * @param options Cache options
 */
export const CachePut = (options?: CacheOptions): MethodDecorator => {
  return <T extends Function>(
    target: Object, 
    propertyKey: string | symbol, 
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> | void => {
    const originalMethod = descriptor.value as Function;
    
    if (!originalMethod) return descriptor;
    
    descriptor.value = async function (this: CacheContext, ...args: unknown[]) {
      const result = await originalMethod.apply(this, args);
      
      const cacheService = this.cacheService || this.cache;
      if (cacheService && result !== null && result !== undefined) {
        const keyPrefix = options?.prefix || `${(target.constructor as any).name}:${String(propertyKey)}`;
        const keyGenerator = options?.keyGenerator || defaultKeyGenerator;
        const cacheKey = keyGenerator(keyPrefix, ...args);
        
        await (cacheService as any).redisService.set(
          cacheKey,
          result,
          options?.ttl,
          { tenantId: this.tenantContext?.getTenantId() }
        );
      }
      
      return result;
    } as any;

    return descriptor;
  };
};

/**
 * Decorator to evict cache
 * @param patterns Cache key patterns to evict
 */
export const CacheEvict = (patterns: string | string[]): MethodDecorator => {
  return <T extends Function>(
    target: Object, 
    propertyKey: string | symbol, 
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> | void => {
    const originalMethod = descriptor.value as Function;
    
    if (!originalMethod) return descriptor;
    
    descriptor.value = async function (this: CacheContext, ...args: unknown[]) {
      const cacheService = this.cacheService || this.cache;
      if (cacheService) {
        // Evict cache before execution
        await cacheService.invalidate(patterns);
      }
      
      return originalMethod.apply(this, args);
    } as any;

    return descriptor;
  };
};

/**
 * Default key generator function
 */
function defaultKeyGenerator(prefix: string, ...args: unknown[]): string {
  const argKey = args
    .map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(arg, Object.keys(arg as object).sort());
      }
      return String(arg);
    })
    .join(':');
  
  return `${prefix}:${argKey}`;
}