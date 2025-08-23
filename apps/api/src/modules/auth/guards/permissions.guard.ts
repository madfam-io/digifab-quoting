import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@madfam/shared';

/**
 * Define permissions for each role
 * This can be extended to support more granular permissions
 */
export enum Permission {
  // Quote permissions
  QUOTE_CREATE = 'quote:create',
  QUOTE_READ = 'quote:read',
  QUOTE_UPDATE = 'quote:update',
  QUOTE_DELETE = 'quote:delete',
  QUOTE_APPROVE = 'quote:approve',
  QUOTE_EXPORT = 'quote:export',

  // Customer permissions
  CUSTOMER_CREATE = 'customer:create',
  CUSTOMER_READ = 'customer:read',
  CUSTOMER_UPDATE = 'customer:update',
  CUSTOMER_DELETE = 'customer:delete',

  // Admin permissions
  ADMIN_CONFIG_READ = 'admin:config:read',
  ADMIN_CONFIG_WRITE = 'admin:config:write',
  ADMIN_USER_MANAGE = 'admin:user:manage',
  ADMIN_TENANT_MANAGE = 'admin:tenant:manage',

  // Pricing permissions
  PRICING_READ = 'pricing:read',
  PRICING_WRITE = 'pricing:write',
  PRICING_OVERRIDE = 'pricing:override',

  // Report permissions
  REPORT_VIEW = 'report:view',
  REPORT_EXPORT = 'report:export',
  REPORT_FINANCIAL = 'report:financial',

  // Audit permissions
  AUDIT_READ = 'audit:read',
  AUDIT_EXPORT = 'audit:export',
}

// Role to permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Admin has all permissions
    ...Object.values(Permission),
  ],

  manager: [
    // Quote permissions
    Permission.QUOTE_CREATE,
    Permission.QUOTE_READ,
    Permission.QUOTE_UPDATE,
    Permission.QUOTE_DELETE,
    Permission.QUOTE_APPROVE,
    Permission.QUOTE_EXPORT,

    // Customer permissions
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_READ,
    Permission.CUSTOMER_UPDATE,

    // Pricing permissions
    Permission.PRICING_READ,
    Permission.PRICING_WRITE,
    Permission.PRICING_OVERRIDE,

    // Report permissions
    Permission.REPORT_VIEW,
    Permission.REPORT_EXPORT,
    Permission.REPORT_FINANCIAL,

    // Audit permissions
    Permission.AUDIT_READ,
  ],

  operator: [
    // Quote permissions
    Permission.QUOTE_CREATE,
    Permission.QUOTE_READ,
    Permission.QUOTE_UPDATE,
    Permission.QUOTE_EXPORT,

    // Customer permissions
    Permission.CUSTOMER_READ,
    Permission.CUSTOMER_UPDATE,

    // Pricing permissions
    Permission.PRICING_READ,

    // Report permissions
    Permission.REPORT_VIEW,
  ],

  support: [
    // Quote permissions
    Permission.QUOTE_READ,

    // Customer permissions
    Permission.CUSTOMER_READ,

    // Report permissions
    Permission.REPORT_VIEW,
  ],

  customer: [
    // Customers can only read their own quotes
    Permission.QUOTE_CREATE,
    Permission.QUOTE_READ,
  ],
};

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRoles = user.roles || [];
    const userPermissions = new Set<Permission>();

    // Collect all permissions for user's roles
    userRoles.forEach((role: UserRole) => {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      rolePermissions.forEach((permission) => userPermissions.add(permission));
    });

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter((p) => !userPermissions.has(p));
      throw new ForbiddenException(
        `Access denied. Missing permissions: ${missingPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
