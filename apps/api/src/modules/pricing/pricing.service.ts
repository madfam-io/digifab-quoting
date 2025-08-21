import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../redis/cache.service';
import { Cacheable } from '../redis/decorators/cache.decorator';
import { ProcessType } from '@madfam/shared';
import { Decimal } from 'decimal.js';

@Injectable()
export class PricingService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {}

  async calculateQuoteItem(
    tenantId: string,
    process: ProcessType,
    geometryMetrics: any,
    materialId: string,
    machineId: string,
    selections: any,
    quantity: number,
    objective: any,
  ) {
    // Simplified pricing calculation for MVP
    const material = await this.prisma.material.findFirst({
      where: { id: materialId, tenantId },
    });

    const machine = await this.prisma.machine.findFirst({
      where: { id: machineId, tenantId },
    });

    if (!material || !machine) {
      throw new Error('Material or machine not found');
    }

    // Basic calculation
    const volumeCm3 = geometryMetrics.volumeCm3 || 1;
    const materialCost = new Decimal(volumeCm3).mul(material.costPerUnit || 1).div(1000); // Convert to cost per cm³
    const machineHours = volumeCm3 / 60; // Simplified: 60 cm³/hour
    const machineCost = new Decimal(machineHours).mul(machine.hourlyRate || 500);
    
    const unitPrice = materialCost.plus(machineCost).mul(1.5); // 50% markup
    const totalPrice = unitPrice.mul(quantity);

    return {
      unitPrice: unitPrice.toNumber(),
      totalPrice: totalPrice.toNumber(),
      leadDays: 5,
      costBreakdown: {
        material: materialCost.toNumber(),
        machine: machineCost.toNumber(),
        overhead: 0,
        margin: unitPrice.sub(materialCost).sub(machineCost).toNumber(),
      },
      sustainability: {
        score: 75,
        co2eKg: 0.5,
        recycledPercent: 20,
      },
    };
  }

  @Cacheable({ prefix: 'materials', ttl: 1800 }) // Cache for 30 minutes
  async getMaterials(tenantId: string, process?: ProcessType) {
    const where: any = {
      tenantId,
    };

    if (process) {
      where.processTypes = {
        has: process,
      };
    }

    return this.prisma.material.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  @Cacheable({ prefix: 'machines', ttl: 1800 }) // Cache for 30 minutes
  async getMachines(tenantId: string, process?: ProcessType) {
    const where: any = {
      tenantId,
    };

    if (process) {
      where.processType = process;
    }

    return this.prisma.machine.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  @Cacheable({ prefix: 'process-options', ttl: 1800 }) // Cache for 30 minutes
  async getProcessOptions(tenantId: string, process?: ProcessType) {
    const where: any = {
      tenantId,
    };

    if (process) {
      where.process = process;
    }

    return this.prisma.processOption.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  @Cacheable({ prefix: 'tenant-pricing-config', ttl: 3600 }) // Cache for 1 hour
  async getTenantPricingConfig(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        settings: true,
        features: true,
      },
    });

    const margins = await this.prisma.margin.findMany({
      where: {
        tenantId,
        active: true,
      },
    });

    const defaultMargin = margins.find(m => m.type === 'default');

    return {
      defaultMargin: defaultMargin?.marginPercent?.toNumber() || 0.3,
      minimumMargin: defaultMargin?.floorPercent?.toNumber() || 0.15,
      targetMargin: defaultMargin?.targetPercent?.toNumber() || 0.35,
      rushOrderRate: tenant?.settings?.['rushOrderRate'] || 0.25,
      overheadRate: tenant?.settings?.['overheadRate'] || 0.15,
      taxRate: tenant?.settings?.['taxRate'] || 0.16, // IVA in Mexico
      quoteValidityDays: tenant?.settings?.['quoteValidityDays'] || 14,
      volumeDiscountThresholds: tenant?.settings?.['volumeDiscountThresholds'] || {
        50: 0.05,
        100: 0.1,
        500: 0.15,
      },
    };
  }
}