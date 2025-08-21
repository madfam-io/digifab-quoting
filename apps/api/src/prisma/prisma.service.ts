import { Injectable, OnModuleInit, INestApplication, Inject, Optional } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { TenantContextService } from '../modules/tenant/tenant-context.service';

// Models that should have tenant isolation
const TENANT_MODELS = [
  'User',
  'Customer',
  'Quote',
  'QuoteItem',
  'File',
  'Material',
  'Machine',
  'ProcessOption',
  'PricingRule',
  'Margin',
  'DiscountRule',
  'ShippingRate',
  'SupplierBid',
  'PaymentIntent',
  'AuditLog',
  'NDAAcceptance',
];

// Models that are global (no tenant isolation)
const GLOBAL_MODELS = ['Tenant', 'FXRate', 'Session'];

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Optional() @Inject(TenantContextService) private tenantContext?: TenantContextService,
  ) {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    
    // Add middleware for multi-tenancy
    this.$use(async (params, next) => {
      // Skip for global models or transactions
      if (GLOBAL_MODELS.includes(params.model!) || params.runInTransaction) {
        return next(params);
      }

      const context = this.tenantContext?.getContext();
      
      // For tenant-scoped models, enforce tenant isolation
      if (TENANT_MODELS.includes(params.model!) && context?.tenantId) {
        // For create operations, add tenantId
        if (params.action === 'create') {
          params.args.data = {
            ...params.args.data,
            tenantId: context.tenantId,
          };
        }
        
        // For createMany operations, add tenantId to each record
        if (params.action === 'createMany') {
          if (Array.isArray(params.args.data)) {
            params.args.data = params.args.data.map((item: any) => ({
              ...item,
              tenantId: context.tenantId,
            }));
          } else {
            params.args.data = {
              ...params.args.data,
              tenantId: context.tenantId,
            };
          }
        }

        // For all query operations, add tenant filter
        if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].includes(params.action)) {
          if (!params.args) {
            params.args = {};
          }
          if (!params.args.where) {
            params.args.where = {};
          }
          
          // Add tenant filter
          params.args.where = {
            ...params.args.where,
            tenantId: context.tenantId,
          };
        }

        // For update operations, add tenant filter to prevent cross-tenant updates
        if (['update', 'updateMany', 'delete', 'deleteMany'].includes(params.action)) {
          if (!params.args.where) {
            params.args.where = {};
          }
          
          params.args.where = {
            ...params.args.where,
            tenantId: context.tenantId,
          };
        }

        // For upsert operations, ensure both create and update respect tenant
        if (params.action === 'upsert') {
          params.args.create = {
            ...params.args.create,
            tenantId: context.tenantId,
          };
          
          params.args.where = {
            ...params.args.where,
            tenantId: context.tenantId,
          };
        }
      }

      return next(params);
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => key[0] !== '_' && key[0] !== '$' && key !== 'constructor',
    );

    return Promise.all(
      models.map((modelKey) => {
        return this[modelKey].deleteMany();
      }),
    );
  }
}