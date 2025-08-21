import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
  tenantCode?: string;
  domain?: string;
  userId?: string;
  userRoles?: string[];
  requestId?: string;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  /**
   * Run a function with the given tenant context
   */
  run<T>(context: TenantContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }

  /**
   * Get the current tenant context
   */
  getContext(): TenantContext | undefined {
    return this.storage.getStore();
  }

  /**
   * Get the current tenant ID (throws if not in context)
   */
  getCurrentTenantId(): string {
    const context = this.getContext();
    if (!context?.tenantId) {
      throw new Error('No tenant context available');
    }
    return context.tenantId;
  }

  /**
   * Get the current user ID
   */
  getCurrentUserId(): string | undefined {
    return this.getContext()?.userId;
  }

  /**
   * Get the current user roles
   */
  getCurrentUserRoles(): string[] {
    return this.getContext()?.userRoles || [];
  }

  /**
   * Check if the current context has a specific role
   */
  hasRole(role: string): boolean {
    const roles = this.getCurrentUserRoles();
    return roles.includes(role);
  }

  /**
   * Check if the current context has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const currentRoles = this.getCurrentUserRoles();
    return roles.some(role => currentRoles.includes(role));
  }

  /**
   * Get the current request ID
   */
  getRequestId(): string | undefined {
    return this.getContext()?.requestId;
  }
}