import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';

@Injectable()
export class TokenBlacklistService {
  private readonly PREFIX = 'blacklist:';
  private readonly TTL = 24 * 60 * 60; // 24 hours

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async blacklistToken(token: string, expiresIn?: number): Promise<void> {
    const hash = this.hashToken(token);
    const key = `${this.PREFIX}${hash}`;
    const ttl = expiresIn || this.TTL;

    await this.cacheManager.set(key, true, ttl);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const hash = this.hashToken(token);
    const key = `${this.PREFIX}${hash}`;

    const result = await this.cacheManager.get(key);
    return !!result;
  }

  async blacklistAllUserTokens(userId: string): Promise<void> {
    // Store a flag that all tokens for this user before current time are invalid
    const key = `${this.PREFIX}user:${userId}`;
    const timestamp = Date.now();

    await this.cacheManager.set(key, timestamp, this.TTL);
  }

  async isUserTokenValid(userId: string, tokenIssuedAt: number): Promise<boolean> {
    const key = `${this.PREFIX}user:${userId}`;
    const blacklistTimestamp = await this.cacheManager.get<number>(key);

    if (!blacklistTimestamp) {
      return true;
    }

    // Token is valid if it was issued after the blacklist timestamp
    return tokenIssuedAt > blacklistTimestamp;
  }

  async clearBlacklist(): Promise<void> {
    // This would typically be implemented with Redis SCAN command
    // For now, individual tokens will expire based on TTL
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
