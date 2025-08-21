import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@madfam/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { TenantContextService } from '../../tenant/tenant-context.service';

/**
 * Role hierarchy for permission inheritance
 * Higher roles inherit permissions from lower roles
 */
const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  admin: ['admin', 'manager', 'operator', 'support', 'customer'],
  manager: ['manager', 'operator', 'support', 'customer'],
  operator: ['operator', 'support', 'customer'],
  support: ['support', 'customer'],
  customer: ['customer'],
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tenantContext: TenantContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Check if user is authenticated
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user roles from JWT and tenant context
    const userRoles = user.roles || [];
    const contextRoles = this.tenantContext.getCurrentUserRoles();
    
    // Combine roles from both sources
    const allUserRoles = [...new Set([...userRoles, ...contextRoles])];
    
    // Check if user has any of the required roles (considering hierarchy)
    const hasRequiredRole = requiredRoles.some(requiredRole => 
      allUserRoles.some(userRole => 
        ROLE_HIERARCHY[userRole as UserRole]?.includes(requiredRole)
      )
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. User roles: ${allUserRoles.join(', ')}`
      );
    }

    return true;
  }
}