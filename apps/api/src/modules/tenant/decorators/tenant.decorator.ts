import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext } from '../tenant-context.service';

/**
 * Decorator to get the current tenant context in controllers
 * 
 * @example
 * ```typescript
 * @Get()
 * findAll(@Tenant() tenant: TenantContext) {
 *   console.log('Current tenant:', tenant.tenantId);
 * }
 * ```
 */
export const Tenant = createParamDecorator(
  (data: keyof TenantContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenantContext = request.tenantContext;

    return data ? tenantContext?.[data] : tenantContext;
  },
);

/**
 * Decorator to get just the tenant ID
 * 
 * @example
 * ```typescript
 * @Get()
 * findAll(@TenantId() tenantId: string) {
 *   console.log('Current tenant ID:', tenantId);
 * }
 * ```
 */
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantContext?.tenantId;
  },
);