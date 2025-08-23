import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface RequestWithTenant extends Request {
  user?: any;
  tenantId?: string;
}

@Injectable()
export class TenantValidationMiddleware implements NestMiddleware {
  use(req: RequestWithTenant, res: Response, next: NextFunction) {
    try {
      // Extract tenant from various sources
      const tenantFromHeader = req.headers['x-tenant-id'] as string;
      const tenantFromSubdomain = this.extractTenantFromHost(req.hostname);
      const tenantFromUser = req.user?.tenantId;

      // Validate consistency
      if (tenantFromHeader && tenantFromUser && tenantFromHeader !== tenantFromUser) {
        throw new UnauthorizedException('Tenant mismatch between header and user context');
      }

      // Set validated tenant ID with priority: user > header > subdomain
      req.tenantId = tenantFromUser || tenantFromHeader || tenantFromSubdomain;

      if (!req.tenantId) {
        throw new UnauthorizedException('Tenant identification required');
      }

      // Validate tenant ID format (UUID)
      if (!this.isValidUUID(req.tenantId)) {
        throw new UnauthorizedException('Invalid tenant ID format');
      }

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Tenant validation failed');
    }
  }

  private extractTenantFromHost(hostname: string): string | undefined {
    // Extract subdomain from hostname
    // e.g., "tenant1.madfam.io" -> "tenant1"
    const parts = hostname.split('.');

    if (parts.length >= 2) {
      const subdomain = parts[0];
      // Ignore common subdomains
      if (!['www', 'api', 'app'].includes(subdomain)) {
        return subdomain;
      }
    }

    return undefined;
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
