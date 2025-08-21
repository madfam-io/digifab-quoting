import { Test, TestingModule } from '@nestjs/testing';
import { TenantContextService, TenantContext } from './tenant-context.service';

describe('TenantContextService', () => {
  let service: TenantContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantContextService],
    }).compile();

    service = module.get<TenantContextService>(TenantContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('should run function with tenant context', () => {
      const context: TenantContext = {
        tenantId: 'tenant-123',
        userId: 'user-123',
        userRoles: ['customer'],
        requestId: 'req-123',
      };

      const result = service.run(context, () => {
        const currentContext = service.getContext();
        expect(currentContext).toEqual(context);
        return 'success';
      });

      expect(result).toBe('success');
    });

    it('should isolate contexts between runs', () => {
      const context1: TenantContext = {
        tenantId: 'tenant-1',
        userId: 'user-1',
        userRoles: ['admin'],
        requestId: 'req-1',
      };

      const context2: TenantContext = {
        tenantId: 'tenant-2',
        userId: 'user-2',
        userRoles: ['customer'],
        requestId: 'req-2',
      };

      service.run(context1, () => {
        expect(service.getContext()).toEqual(context1);
        
        service.run(context2, () => {
          expect(service.getContext()).toEqual(context2);
        });
        
        // Context should be restored
        expect(service.getContext()).toEqual(context1);
      });

      // Outside of runs, context should be undefined
      expect(service.getContext()).toBeUndefined();
    });
  });

  describe('getContext', () => {
    it('should return undefined when not in context', () => {
      expect(service.getContext()).toBeUndefined();
    });

    it('should return current context when in run', () => {
      const context: TenantContext = {
        tenantId: 'tenant-123',
        tenantCode: 'ACME',
        domain: 'acme',
        userId: 'user-123',
        userRoles: ['manager'],
        requestId: 'req-123',
      };

      service.run(context, () => {
        expect(service.getContext()).toEqual(context);
      });
    });
  });

  describe('getCurrentTenantId', () => {
    it('should return tenant ID when in context', () => {
      const context: TenantContext = {
        tenantId: 'tenant-123',
        userId: 'user-123',
        userRoles: [],
      };

      service.run(context, () => {
        expect(service.getCurrentTenantId()).toBe('tenant-123');
      });
    });

    it('should throw error when not in context', () => {
      expect(() => service.getCurrentTenantId()).toThrow('No tenant context available');
    });

    it('should throw error when tenant ID is missing', () => {
      const context: TenantContext = {
        tenantId: '',
        userId: 'user-123',
        userRoles: [],
      };

      service.run(context, () => {
        expect(() => service.getCurrentTenantId()).toThrow('No tenant context available');
      });
    });
  });

  describe('getCurrentUserId', () => {
    it('should return user ID when available', () => {
      const context: TenantContext = {
        tenantId: 'tenant-123',
        userId: 'user-123',
        userRoles: [],
      };

      service.run(context, () => {
        expect(service.getCurrentUserId()).toBe('user-123');
      });
    });

    it('should return undefined when user ID not available', () => {
      const context: TenantContext = {
        tenantId: 'tenant-123',
        userRoles: [],
      };

      service.run(context, () => {
        expect(service.getCurrentUserId()).toBeUndefined();
      });
    });

    it('should return undefined when not in context', () => {
      expect(service.getCurrentUserId()).toBeUndefined();
    });
  });

  describe('getCurrentUserRoles', () => {
    it('should return user roles when available', () => {
      const context: TenantContext = {
        tenantId: 'tenant-123',
        userRoles: ['admin', 'manager'],
      };

      service.run(context, () => {
        expect(service.getCurrentUserRoles()).toEqual(['admin', 'manager']);
      });
    });

    it('should return empty array when roles not available', () => {
      const context: TenantContext = {
        tenantId: 'tenant-123',
      };

      service.run(context, () => {
        expect(service.getCurrentUserRoles()).toEqual([]);
      });
    });

    it('should return empty array when not in context', () => {
      expect(service.getCurrentUserRoles()).toEqual([]);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has role', () => {
      const context: TenantContext = {
        tenantId: 'tenant-123',
        userRoles: ['admin', 'manager'],
      };

      service.run(context, () => {
        expect(service.hasRole('admin')).toBe(true);
        expect(service.hasRole('manager')).toBe(true);
      });
    });

    it('should return false when user does not have role', () => {
      const context: TenantContext = {
        tenantId: 'tenant-123',
        userRoles: ['customer'],
      };

      service.run(context, () => {
        expect(service.hasRole('admin')).toBe(false);
        expect(service.hasRole('manager')).toBe(false);
      });
    });

    it('should return false when not in context', () => {
      expect(service.hasRole('admin')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has any of the roles', () => {
      const context: TenantContext = {
        tenantId: 'tenant-123',
        userRoles: ['customer'],
      };

      service.run(context, () => {
        expect(service.hasAnyRole(['admin', 'customer'])).toBe(true);
        expect(service.hasAnyRole(['customer', 'support'])).toBe(true);
      });
    });

    it('should return false when user has none of the roles', () => {
      const context: TenantContext = {
        tenantId: 'tenant-123',
        userRoles: ['customer'],
      };

      service.run(context, () => {
        expect(service.hasAnyRole(['admin', 'manager'])).toBe(false);
      });
    });

    it('should return false when not in context', () => {
      expect(service.hasAnyRole(['admin', 'customer'])).toBe(false);
    });
  });

  describe('getRequestId', () => {
    it('should return request ID when available', () => {
      const context: TenantContext = {
        tenantId: 'tenant-123',
        requestId: 'req-123',
      };

      service.run(context, () => {
        expect(service.getRequestId()).toBe('req-123');
      });
    });

    it('should return undefined when request ID not available', () => {
      const context: TenantContext = {
        tenantId: 'tenant-123',
      };

      service.run(context, () => {
        expect(service.getRequestId()).toBeUndefined();
      });
    });

    it('should return undefined when not in context', () => {
      expect(service.getRequestId()).toBeUndefined();
    });
  });
});