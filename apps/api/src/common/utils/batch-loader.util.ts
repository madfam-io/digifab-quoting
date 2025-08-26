import { Injectable } from '@nestjs/common';

interface BatchLoadOptions {
  maxBatchSize?: number;
  batchWindowMs?: number;
}

interface BatchRequest<K, V> {
  key: K;
  resolve: (value: V | null) => void;
  reject: (error: Error) => void;
}

@Injectable()
export class BatchLoader<K, V> {
  private pending: BatchRequest<K, V>[] = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly batchLoadFn: (keys: K[]) => Promise<V[]>,
    private readonly keyFn: (item: V) => K,
    private readonly options: BatchLoadOptions = {},
  ) {}

  async load(key: K): Promise<V | null> {
    return new Promise<V | null>((resolve, reject) => {
      this.pending.push({ key, resolve, reject });

      if (this.pending.length >= (this.options.maxBatchSize || 100)) {
        this.dispatchBatch();
      } else if (!this.timer) {
        this.timer = setTimeout(() => {
          this.dispatchBatch();
        }, this.options.batchWindowMs || 10);
      }
    });
  }

  async loadMany(keys: K[]): Promise<(V | null)[]> {
    return Promise.all(keys.map(key => this.load(key)));
  }

  private async dispatchBatch(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const batch = this.pending.splice(0);
    if (batch.length === 0) return;

    try {
      const keys = batch.map(request => request.key);
      const values = await this.batchLoadFn(keys);
      
      // Create a map for O(1) lookups
      const valueMap = new Map<K, V>();
      values.forEach(value => {
        const key = this.keyFn(value);
        valueMap.set(key, value);
      });

      // Resolve all pending requests
      batch.forEach(request => {
        const value = valueMap.get(request.key) || null;
        request.resolve(value);
      });
    } catch (error) {
      // Reject all pending requests
      batch.forEach(request => {
        request.reject(error instanceof Error ? error : new Error(String(error)));
      });
    }
  }
}

// Factory for creating common batch loaders
export class BatchLoaderFactory {
  static createMaterialLoader(prisma: any) {
    return new BatchLoader(
      async (ids: string[]) => {
        return await prisma.material.findMany({
          where: { id: { in: ids }, active: true },
        });
      },
      (material: any) => material.id,
      { maxBatchSize: 50, batchWindowMs: 5 }
    );
  }

  static createMachineLoader(prisma: any) {
    return new BatchLoader(
      async (ids: string[]) => {
        return await prisma.machine.findMany({
          where: { id: { in: ids }, active: true },
        });
      },
      (machine: any) => machine.id,
      { maxBatchSize: 50, batchWindowMs: 5 }
    );
  }

  static createTenantConfigLoader(prisma: any) {
    return new BatchLoader(
      async (tenantIds: string[]) => {
        const tenants = await prisma.tenant.findMany({
          where: { id: { in: tenantIds } },
          select: { id: true, settings: true, features: true },
        });
        
        const margins = await prisma.margin.findMany({
          where: { tenantId: { in: tenantIds }, active: true },
        });
        
        return tenants.map(tenant => ({
          ...tenant,
          margins: margins.filter(m => m.tenantId === tenant.id),
        }));
      },
      (config: any) => config.id,
      { maxBatchSize: 20, batchWindowMs: 10 }
    );
  }
}