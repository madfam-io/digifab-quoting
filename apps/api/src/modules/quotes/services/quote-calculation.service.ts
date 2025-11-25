import { Injectable, Logger } from '@nestjs/common';
import { Prisma, QuoteItem } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateQuoteItemDto } from '../dto/update-quote-item.dto';
import { Material, Machine, ProcessType, QuoteItemSelections } from '@cotiza/shared';
import {
  PricingEngine,
  TenantPricingConfig,
  GeometryMetrics as PricingGeometryMetrics,
} from '@cotiza/pricing-engine';
import { CacheService } from '@/modules/redis/cache.service';
import Decimal from 'decimal.js';

interface CalculationResult {
  itemsToUpdate: Array<{
    id: string;
    data: Prisma.QuoteItemUpdateInput;
  }>;
  totals: {
    subtotal: Decimal;
    tax: Decimal;
    shipping: Decimal;
    grandTotal: Decimal;
  };
  warnings: string[];
}

interface FileData {
  id: string;
  name: string;
  url: string;
  analyzedAt?: Date | null;
  filename?: string;
  originalName?: string;
  size?: number;
}

interface DfmReport {
  id: string;
  metrics: Record<string, unknown>;
}

type PrismaQuoteWithItems = Prisma.QuoteGetPayload<{
  include: {
    items: {
      include: {
        files: {
          where: { analyzedAt: { not: null } };
        };
        dfmReport: true;
      };
    };
  };
}>;

interface ItemWithRelations extends QuoteItem {
  files: FileData[];
  dfmReport?: DfmReport | null;
}

@Injectable()
export class QuoteCalculationService {
  private readonly logger = new Logger(QuoteCalculationService.name);
  private readonly pricingEngine: PricingEngine;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {
    this.pricingEngine = new PricingEngine();
  }

  async calculateQuote(
    quoteId: string,
    tenantId: string,
    itemsData?: UpdateQuoteItemDto[],
  ): Promise<CalculationResult> {
    // Start transaction for consistency
    return this.prisma.$transaction(async (tx) => {
      // 1. Load quote with all necessary relations in a single query
      const quote = await this.loadQuoteWithRelations(tx, quoteId, tenantId);
      if (!quote) {
        throw new Error('Quote not found');
      }

      // 2. Prepare items for calculation
      const itemsToCalculate = this.prepareItemsForCalculation(quote.items, itemsData);

      // 3. Batch load materials and machines
      const { materials, machines } = await this.batchLoadResources(tx, itemsToCalculate, tenantId);

      // 4. Calculate pricing for all items
      const calculationResults = await this.calculateItemPricing(
        itemsToCalculate,
        materials,
        machines,
        tenantId,
      );

      // 5. Prepare updates and calculate totals
      const result = this.prepareCalculationResult(calculationResults, quote.currency);

      return result;
    });
  }

  private async loadQuoteWithRelations(
    tx: Prisma.TransactionClient,
    quoteId: string,
    tenantId: string,
  ) {
    return tx.quote.findFirst({
      where: { id: quoteId, tenantId },
      include: {
        items: {
          include: {
            files: {
              where: { analyzedAt: { not: null } },
            },
            dfmReport: true,
          },
        },
      },
    });
  }

  private prepareItemsForCalculation(
    existingItems: PrismaQuoteWithItems['items'],
    updates?: UpdateQuoteItemDto[],
  ): ItemWithRelations[] {
    if (!updates || updates.length === 0) {
      return existingItems
        .filter((item) => item.files.length > 0)
        .map((item) => this.mapPrismaItemToItemWithRelations(item));
    }

    // Create a map for quick lookup
    const updateMap = new Map(updates.map((u) => [u.itemId, u]));

    return existingItems
      .filter((item) => updateMap.has(item.id))
      .map((item) => {
        const update = updateMap.get(item.id);
        if (!update) {
          throw new Error(`Update not found for item ${item.id}`);
        }
        const mappedItem = this.mapPrismaItemToItemWithRelations(item);
        return {
          ...mappedItem,
          material: update.material || mappedItem.material,
          selections: {
            ...(typeof mappedItem.selections === 'object' && mappedItem.selections !== null
              ? (mappedItem.selections as Record<string, unknown>)
              : {}),
            ...(update.selections || {}),
          } as Prisma.JsonValue,
          quantity: update.quantity ?? mappedItem.quantity,
        };
      });
  }

  private mapPrismaItemToItemWithRelations(
    prismaItem: PrismaQuoteWithItems['items'][0],
  ): ItemWithRelations {
    return {
      ...prismaItem,
      files: prismaItem.files.map((file) => ({
        id: file.id,
        name: file.originalName,
        url: file.path, // or generate URL from S3 path
        analyzedAt: file.analyzedAt,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
      })),
      dfmReport: prismaItem.dfmReport
        ? {
            id: prismaItem.dfmReport.id,
            metrics: prismaItem.dfmReport.metrics as Record<string, unknown>,
          }
        : null,
    };
  }

  private async batchLoadResources(
    tx: Prisma.TransactionClient,
    items: ItemWithRelations[],
    tenantId: string,
  ) {
    // Extract unique material and machine IDs
    const materialCodes = [...new Set(items.map((i) => i.material))];
    const processes = [...new Set(items.map((i) => i.process))];

    // Batch load all materials and machines
    const [materials, machines] = await Promise.all([
      this.batchLoadMaterials(tx, materialCodes, processes as ProcessType[], tenantId),
      this.batchLoadMachines(tx, processes as ProcessType[], tenantId),
    ]);

    return { materials, machines };
  }

  private async batchLoadMaterials(
    tx: Prisma.TransactionClient,
    codes: string[],
    processes: ProcessType[],
    tenantId: string,
  ): Promise<Map<string, Material>> {
    const materials = await tx.material.findMany({
      where: {
        tenantId,
        code: { in: codes },
        process: { in: processes },
        active: true,
      },
    });

    return new Map(materials.map((m) => [`${m.process}-${m.code}`, m as unknown as Material]));
  }

  private async batchLoadMachines(
    tx: Prisma.TransactionClient,
    processes: ProcessType[],
    tenantId: string,
  ): Promise<Map<ProcessType, Machine>> {
    const machines = await tx.machine.findMany({
      where: {
        tenantId,
        process: { in: processes },
        active: true,
      },
      orderBy: { hourlyRate: 'asc' }, // Get cheapest machine
      distinct: ['process'],
    });

    return new Map(machines.map((m) => [m.process as ProcessType, m as unknown as Machine]));
  }

  private async calculateItemPricing(
    items: ItemWithRelations[],
    materials: Map<string, Material>,
    machines: Map<ProcessType, Machine>,
    tenantId: string,
  ) {
    // Get tenant configuration
    const tenantConfig = await this.getCachedTenantConfig(tenantId);

    // Calculate pricing for all items in parallel
    const calculations = await Promise.allSettled(
      items.map(async (item) => {
        const material = materials.get(`${item.process}-${item.material}`);
        const machine = machines.get(item.process as ProcessType);

        if (!material || !machine) {
          return {
            item,
            error: `Missing ${!material ? 'material' : 'machine'} for item`,
          };
        }

        try {
          // Extract geometry from DFM report
          const geometry = this.extractGeometry(item);

          // Use pricing engine to calculate
          const pricingResult = this.pricingEngine.calculate({
            process: item.process as ProcessType,
            geometry,
            material: material as Material,
            machine: machine as Machine,
            selections: item.selections as unknown as QuoteItemSelections,
            quantity: item.quantity,
            tenantConfig,
          });

          return {
            item,
            pricing: pricingResult,
          };
        } catch (error) {
          this.logger.error(`Pricing calculation failed for item ${item.id}`, error);
          return {
            item,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
    );

    return calculations.map((result) => {
      if (result.status === 'rejected') {
        return { error: result.reason };
      }
      return result.value;
    });
  }

  private extractGeometry(item: ItemWithRelations): PricingGeometryMetrics {
    const metrics = item.dfmReport?.metrics || {};
    const metricsData = metrics as Record<string, unknown>;

    return {
      volumeCm3: (metricsData.volumeCm3 as number) || 0,
      surfaceAreaCm2: (metricsData.surfaceAreaCm2 as number) || 0,
      bboxMm: (metricsData.bboxMm as { x: number; y: number; z: number }) || { x: 0, y: 0, z: 0 },
      // Additional geometry based on process
      ...(item.process === ProcessType.LASER_2D && {
        cutLengthMm: (metricsData.lengthCutMm as number) || 0,
        pierceCount: (metricsData.holesCount as number) || 0,
      }),
      ...(item.process === ProcessType.CNC_3AXIS && {
        features: {
          holes: (metricsData.holesCount as number) || 0,
        },
      }),
    };
  }

  private prepareCalculationResult(
    calculations: Array<{
      error?: string;
      item?: ItemWithRelations;
      pricing?: {
        unitPrice: Decimal;
        totalPrice: Decimal;
        leadDays: number;
        costBreakdown: {
          material: Decimal;
          machine: Decimal;
          energy: Decimal;
          labor: Decimal;
          overhead: Decimal;
          margin: Decimal;
          tooling?: Decimal;
          discount?: Decimal;
        };
        sustainability: {
          score: number;
          co2eKg: Decimal;
          energyKwh: Decimal;
          recycledPercent: number;
          wastePercent: number;
        };
        warnings?: string[];
      };
    }>,
    _currency: string,
  ): CalculationResult {
    const itemsToUpdate: Array<{ id: string; data: Prisma.QuoteItemUpdateInput }> = [];
    const warnings: string[] = [];
    let subtotal = new Decimal(0);

    for (const calc of calculations) {
      if (calc.error) {
        warnings.push(calc.error);
        continue;
      }

      const { item, pricing } = calc;

      if (!pricing) {
        warnings.push(`No pricing available for item ${item.id}`);
        continue;
      }

      // Handle warnings from pricing engine
      if (pricing.warnings && pricing.warnings.length > 0) {
        warnings.push(...pricing.warnings);
      }

      itemsToUpdate.push({
        id: item.id,
        data: {
          unitPrice: pricing.unitPrice.toNumber(),
          totalPrice: pricing.totalPrice.toNumber(),
          leadDays: pricing.leadDays,
          costBreakdown: this.formatCostBreakdown(pricing.costBreakdown),
          sustainability: this.formatSustainability(pricing.sustainability),
        },
      });

      subtotal = subtotal.plus(pricing.totalPrice);
    }

    // Calculate totals
    const tax = subtotal.mul(0.16); // 16% tax rate
    const shipping = subtotal.gt(1000) ? new Decimal(0) : new Decimal(150); // Free shipping over 1000
    const grandTotal = subtotal.plus(tax).plus(shipping);

    return {
      itemsToUpdate,
      totals: {
        subtotal,
        tax,
        shipping,
        grandTotal,
      },
      warnings,
    };
  }

  private formatCostBreakdown(breakdown: {
    material: Decimal;
    machine: Decimal;
    energy: Decimal;
    labor: Decimal;
    overhead: Decimal;
    margin: Decimal;
    tooling?: Decimal;
    discount?: Decimal;
  }): Prisma.JsonValue {
    return {
      material: breakdown.material.toNumber(),
      machine: breakdown.machine.toNumber(),
      energy: breakdown.energy.toNumber(),
      labor: breakdown.labor.toNumber(),
      overhead: breakdown.overhead.toNumber(),
      margin: breakdown.margin.toNumber(),
      ...(breakdown.tooling && { tooling: breakdown.tooling.toNumber() }),
      ...(breakdown.discount && { discount: breakdown.discount.toNumber() }),
    };
  }

  private formatSustainability(sustainability: {
    score: number;
    co2eKg: Decimal;
    energyKwh: Decimal;
    recycledPercent: number;
    wastePercent: number;
  }): Prisma.JsonValue {
    return {
      score: sustainability.score,
      co2eKg: sustainability.co2eKg.toNumber(),
      energyKwh: sustainability.energyKwh.toNumber(),
      recycledPercent: sustainability.recycledPercent,
      wastePercent: sustainability.wastePercent,
    };
  }

  private async getCachedTenantConfig(tenantId: string): Promise<TenantPricingConfig> {
    const cacheKey = `tenant-config:${tenantId}`;

    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return this.parseTenantConfig(cached as Record<string, unknown>);
    }

    // Load from database
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    const config = this.parseTenantConfig((tenant?.settings as Record<string, unknown>) || {});

    // Cache for 1 hour
    await this.cacheService.set(cacheKey, config, 3600);

    return config;
  }

  private parseTenantConfig(settings: Record<string, unknown>): TenantPricingConfig {
    const volumeDiscounts = (settings.volumeDiscounts as Array<{
      minQuantity: number;
      discountPercent: number;
    }>) || [
      { minQuantity: 10, discountPercent: 5 },
      { minQuantity: 50, discountPercent: 10 },
      { minQuantity: 100, discountPercent: 15 },
    ];

    return {
      marginFloorPercent: new Decimal((settings.marginFloorPercent as number) || 30),
      overheadPercent: new Decimal((settings.overheadPercent as number) || 15),
      energyTariffPerKwh: new Decimal((settings.energyTariffPerKwh as number) || 0.12),
      laborRatePerHour: new Decimal((settings.laborRatePerHour as number) || 25),
      rushUpchargePercent: new Decimal((settings.rushUpchargePercent as number) || 50),
      volumeDiscounts: volumeDiscounts.map((vd) => ({
        minQuantity: vd.minQuantity,
        discountPercent: new Decimal(vd.discountPercent),
      })),
      gridCo2eFactor: new Decimal((settings.gridCo2eFactor as number) || 0.42),
      logisticsCo2eFactor: new Decimal((settings.logisticsCo2eFactor as number) || 0.0002),
    };
  }
}
