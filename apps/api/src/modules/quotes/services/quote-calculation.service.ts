import { Injectable, Logger } from '@nestjs/common';
import { Prisma, QuoteStatus, QuoteItem } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { PricingService } from '@/modules/pricing/pricing.service';
import { CacheService } from '@/cache/cache.service';
import { UpdateQuoteItemDto } from '../dto/update-quote-item.dto';
import { Material, Machine, ProcessType } from '@madfam/shared';
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

interface ItemWithRelations extends QuoteItem {
  files: any[];
  dfmReport?: any;
}

@Injectable()
export class QuoteCalculationService {
  private readonly logger = new Logger(QuoteCalculationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
    private readonly cacheService: CacheService,
  ) {}

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
    existingItems: ItemWithRelations[],
    updates?: UpdateQuoteItemDto[],
  ): ItemWithRelations[] {
    if (!updates || updates.length === 0) {
      return existingItems.filter((item) => item.status === 'pending' && item.files.length > 0);
    }

    // Create a map for quick lookup
    const updateMap = new Map(updates.map((u) => [u.itemId, u]));

    return existingItems
      .filter((item) => updateMap.has(item.id))
      .map((item) => {
        const update = updateMap.get(item.id)!;
        return {
          ...item,
          material: update.material || item.material,
          selections: { ...item.selections, ...update.selections },
          quantity: update.quantity ?? item.quantity,
        };
      });
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
      this.batchLoadMaterials(tx, materialCodes, processes, tenantId),
      this.batchLoadMachines(tx, processes, tenantId),
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

    return new Map(materials.map((m) => [`${m.process}-${m.code}`, m]));
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

    return new Map(machines.map((m) => [m.process as ProcessType, m]));
  }

  private async calculateItemPricing(
    items: ItemWithRelations[],
    materials: Map<string, Material>,
    machines: Map<ProcessType, Machine>,
    tenantId: string,
  ) {
    // Get tenant config from cache
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
          const geometry = this.extractGeometry(item);
          const pricingResult = await this.pricingService.calculatePricing({
            process: item.process as ProcessType,
            geometry,
            material,
            machine,
            selections: item.selections as any,
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
            error: error.message,
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

  private extractGeometry(item: ItemWithRelations) {
    const metrics = item.dfmReport?.metrics || {};
    const file = item.files[0]; // Use first analyzed file

    return {
      volumeCm3: metrics.volumeCm3 || 0,
      surfaceAreaCm2: metrics.surfaceAreaCm2 || 0,
      bboxMm: metrics.bboxMm || { x: 0, y: 0, z: 0 },
      // Additional geometry based on process
      ...(item.process === ProcessType.LASER_2D && {
        cutLengthMm: metrics.cutLengthMm || 0,
        pierceCount: metrics.pierceCount || 0,
      }),
      ...(item.process === ProcessType.CNC_3AXIS && {
        features: metrics.features || {},
      }),
    };
  }

  private prepareCalculationResult(calculations: any[], currency: string): CalculationResult {
    const itemsToUpdate: Array<{ id: string; data: Prisma.QuoteItemUpdateInput }> = [];
    const warnings: string[] = [];
    let subtotal = new Decimal(0);

    for (const calc of calculations) {
      if (calc.error) {
        warnings.push(calc.error);
        continue;
      }

      const { item, pricing } = calc;

      itemsToUpdate.push({
        id: item.id,
        data: {
          status: 'quoted',
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

  private formatCostBreakdown(breakdown: any): Prisma.JsonValue {
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

  private formatSustainability(sustainability: any): Prisma.JsonValue {
    return {
      score: sustainability.score,
      co2eKg: sustainability.co2eKg.toNumber(),
      energyKwh: sustainability.energyKwh.toNumber(),
      recycledPercent: sustainability.recycledPercent,
      wastePercent: sustainability.wastePercent,
    };
  }

  private async getCachedTenantConfig(tenantId: string) {
    const cacheKey = `tenant-config:${tenantId}`;

    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return this.parseTenantConfig(cached);
    }

    // Load from database
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    const config = this.parseTenantConfig(tenant?.settings || {});

    // Cache for 1 hour
    await this.cacheService.set(cacheKey, config, 3600);

    return config;
  }

  private parseTenantConfig(settings: any) {
    return {
      marginFloorPercent: new Decimal(settings.marginFloorPercent || 30),
      overheadPercent: new Decimal(settings.overheadPercent || 15),
      energyTariffPerKwh: new Decimal(settings.energyTariffPerKwh || 0.12),
      laborRatePerHour: new Decimal(settings.laborRatePerHour || 25),
      rushUpchargePercent: new Decimal(settings.rushUpchargePercent || 50),
      volumeDiscounts: settings.volumeDiscounts || [
        { minQuantity: 10, discountPercent: new Decimal(5) },
        { minQuantity: 50, discountPercent: new Decimal(10) },
        { minQuantity: 100, discountPercent: new Decimal(15) },
      ],
      gridCo2eFactor: new Decimal(settings.gridCo2eFactor || 0.42),
      logisticsCo2eFactor: new Decimal(settings.logisticsCo2eFactor || 0.0002),
    };
  }
}
