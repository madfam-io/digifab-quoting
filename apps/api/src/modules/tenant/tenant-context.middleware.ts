import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly prisma: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Generate request ID
      const requestId = req.headers['x-request-id'] as string || randomUUID();
      
      // Extract tenant information from various sources
      let tenantId: string | undefined;
      let tenantCode: string | undefined;
      let domain: string | undefined;

      // 1. Check for tenant ID in header (API usage)
      if (req.headers['x-tenant-id']) {
        tenantId = req.headers['x-tenant-id'] as string;
      }
      
      // 2. Check for tenant code in header
      if (req.headers['x-tenant-code']) {
        tenantCode = req.headers['x-tenant-code'] as string;
      }

      // 3. Extract from subdomain (e.g., tenant1.madfam.com)
      const host = req.headers.host || '';
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        domain = subdomain;
      }

      // 4. For authenticated requests, get from JWT
      const user = (req as any).user;
      if (user?.tenantId) {
        tenantId = user.tenantId;
      }

      // Resolve tenant if we have code or domain but not ID
      if (!tenantId && (tenantCode || domain)) {
        const tenant = await this.prisma.tenant.findFirst({
          where: {
            OR: [
              tenantCode ? { code: tenantCode } : null,
              domain ? { domain: domain } : null,
            ].filter(Boolean) as any[],
            active: true,
          },
        });

        if (tenant) {
          tenantId = tenant.id;
          tenantCode = tenant.code;
          domain = tenant.domain || undefined;
        }
      }

      // For public endpoints (health, login), we don't require tenant
      const isPublicEndpoint = this.isPublicEndpoint(req.path);
      
      
      if (!tenantId && !isPublicEndpoint) {
        // For MVP, use default tenant if none specified
        const defaultTenant = await this.prisma.tenant.findFirst({
          where: { code: 'default' },
        });
        
        if (defaultTenant) {
          tenantId = defaultTenant.id;
          tenantCode = defaultTenant.code;
        } else {
          throw new UnauthorizedException('Tenant context required');
        }
      }

      // Create the context (even if tenantId is null for public endpoints)
      const context = {
        tenantId: tenantId || '',
        tenantCode,
        domain,
        userId: user?.id,
        userRoles: user?.roles || [],
        requestId,
      };

      // Attach context to request for decorators
      (req as any).tenantContext = context;

      // Add request ID to response headers
      res.setHeader('X-Request-Id', requestId);
      
      // Run the request in tenant context
      this.tenantContext.run(context, () => {
        next();
      });
    } catch (error) {
      next(error);
    }
  }

  private isPublicEndpoint(path: string): boolean {
    const publicPaths = [
      '/health',
      '/auth/login',
      '/auth/register', 
      '/auth/refresh',
    ];
    
    // Check if the path contains any of the public paths
    return publicPaths.some(p => path.includes(p));
  }
}