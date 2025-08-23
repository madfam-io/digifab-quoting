import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RateLimitService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const current = (await this.cacheManager.get<number>(key)) || 0;

    if (current >= limit) {
      return false;
    }

    await this.cacheManager.set(key, current + 1, windowSeconds * 1000);
    return true;
  }

  async getRemainingRequests(key: string, limit: number): Promise<number> {
    const current = (await this.cacheManager.get<number>(key)) || 0;
    return Math.max(0, limit - current);
  }

  async resetRateLimit(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}
