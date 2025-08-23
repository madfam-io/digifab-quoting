import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../services/api-key.service';
import { RateLimitService } from '../services/rate-limit.service';

export const API_KEY_HEADER = 'x-api-key';
export const REQUIRE_API_KEY = 'requireApiKey';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private apiKeyService: ApiKeyService,
    private rateLimitService: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireApiKey = this.reflector.getAllAndOverride<boolean>(REQUIRE_API_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireApiKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers[API_KEY_HEADER];

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // Validate API key
    const keyData = await this.apiKeyService.validateApiKey(apiKey);
    if (!keyData) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Check if key is active
    if (!keyData.isActive) {
      throw new UnauthorizedException('API key is inactive');
    }

    // Check expiration
    if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    // Rate limiting for API keys
    const rateLimitKey = `api-key:${keyData.id}`;
    const isAllowed = await this.rateLimitService.checkRateLimit(
      rateLimitKey,
      keyData.rateLimit || 1000, // Default 1000 requests per hour
      3600, // 1 hour window
    );

    if (!isAllowed) {
      throw new UnauthorizedException('API key rate limit exceeded');
    }

    // Log API key usage
    await this.apiKeyService.logUsage(keyData.id, request.ip, request.url);

    // Attach API key data to request
    request.apiKey = keyData;
    request.tenantId = keyData.tenantId;

    return true;
  }
}
