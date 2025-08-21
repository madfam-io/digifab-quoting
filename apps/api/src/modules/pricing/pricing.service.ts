import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PricingEngine, PricingInput, TenantPricingConfig } from '@madfam/pricing-engine';
import { Decimal } from 'decimal.js';
import { QuoteItem, Material, Machine } from '@prisma/client';
import * as AWS from 'aws-sdk';

@Injectable()
export class PricingService {
  private pricingEngine: PricingEngine;
  private sqs: AWS.SQS;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.pricingEngine = new PricingEngine();
    this.sqs = new AWS.SQS({
      region: this.configService.get('aws.region'),
    });
  }

  async calculateQuoteItem(
    tenantId: string,
    quoteItem: any,
    objective: any,
  ): Promise<any> {
    // Get DFM report if available
    let dfmReport = quoteItem.dfmReport;
    
    // If no DFM report, request geometry analysis
    if (!dfmReport) {
      dfmReport = await this.requestGeometryAnalysis(tenantId, quoteItem);
    }

    // Get material and machine
    const material = await this.getMaterial(tenantId, quoteItem.process, quoteItem.selections.material);
    const machine = await this.getMachine(tenantId, quoteItem.process);
    
    // Get tenant pricing configuration
    const tenantConfig = await this.getTenantPricingConfig(tenantId);

    // Prepare pricing input
    const pricingInput: PricingInput = {
      process: quoteItem.process,
      geometry: dfmReport.metrics,
      material: this.convertMaterial(material),
      machine: this.convertMachine(machine),
      selections: quoteItem.selections,
      quantity: quoteItem.quantity,
      requiredByDate: quoteItem.requiredBy ? new Date(quoteItem.requiredBy) : undefined,
      tenantConfig,
    };

    // Calculate pricing
    try {
      const result = this.pricingEngine.calculate(pricingInput);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(`Pricing calculation failed: ${error.message}`);
    }
  }

  async getMaterials(tenantId: string, process?: string) {
    const where = {
      tenantId,
      active: true,
      ...(process && { process }),
      OR: [
        { versionEffectiveTo: null },
        { versionEffectiveTo: { gte: new Date() } },
      ],
    };

    return this.prisma.material.findMany({
      where,
      orderBy: [
        { process: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async getMachines(tenantId: string, process?: string) {
    const where = {
      tenantId,
      active: true,
      ...(process && { process }),
    };

    return this.prisma.machine.findMany({
      where,
      orderBy: [
        { process: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async getProcessOptions(tenantId: string, process?: string) {
    const where = {
      tenantId,
      active: true,
      ...(process && { process }),
    };

    return this.prisma.processOption.findMany({
      where,
    });
  }

  private async getMaterial(
    tenantId: string,
    process: string,
    materialCode: string,
  ): Promise<Material> {
    const material = await this.prisma.material.findFirst({
      where: {
        tenantId,
        process,
        code: materialCode,
        active: true,
        OR: [
          { versionEffectiveTo: null },
          { versionEffectiveTo: { gte: new Date() } },
        ],
      },
      orderBy: {
        versionEffectiveFrom: 'desc',
      },
    });

    if (!material) {
      throw new InternalServerErrorException(`Material ${materialCode} not found for process ${process}`);
    }

    return material;
  }

  private async getMachine(
    tenantId: string,
    process: string,
  ): Promise<Machine> {
    // For MVP, select the first available machine for the process
    const machine = await this.prisma.machine.findFirst({
      where: {
        tenantId,
        process,
        active: true,
      },
    });

    if (!machine) {
      throw new InternalServerErrorException(`No machine available for process ${process}`);
    }

    return machine;
  }

  private async getTenantPricingConfig(tenantId: string): Promise<TenantPricingConfig> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    // Get process options for margin floors
    const processOptions = await this.prisma.processOption.findMany({
      where: { tenantId, active: true },
    });

    // Get discount rules
    const discountRules = await this.prisma.discountRule.findMany({
      where: { tenantId, active: true, scope: 'quote' },
    });

    // Extract volume discounts
    const volumeDiscounts = discountRules
      .filter(rule => rule.thresholds)
      .flatMap(rule => {
        const thresholds = rule.thresholds as any[];
        return thresholds.map(t => ({
          minQuantity: t.min,
          discountPercent: new Decimal(t.percent),
        }));
      })
      .sort((a, b) => a.minQuantity - b.minQuantity);

    // Default configuration with overrides from tenant settings
    const settings = tenant?.settings as any || {};
    
    return {
      marginFloorPercent: new Decimal(settings.marginFloorPercent || 30),
      overheadPercent: new Decimal(settings.overheadPercent || 15),
      energyTariffPerKwh: new Decimal(settings.energyTariffPerKwh || 0.12),
      laborRatePerHour: new Decimal(settings.laborRatePerHour || 25),
      rushUpchargePercent: new Decimal(settings.rushUpchargePercent || 50),
      volumeDiscounts,
      gridCo2eFactor: new Decimal(settings.gridCo2eFactor || 0.42),
      logisticsCo2eFactor: new Decimal(settings.logisticsCo2eFactor || 0.0002),
    };
  }

  private async requestGeometryAnalysis(tenantId: string, quoteItem: any): Promise<any> {
    // For MVP, return mock data
    // TODO: Implement actual geometry analysis via SQS/Python worker
    
    const mockMetrics = {
      volumeCm3: 50,
      surfaceAreaCm2: 120,
      bboxMm: { x: 100, y: 80, z: 60 },
      lengthCutMm: quoteItem.process === 'laser_2d' ? 500 : undefined,
      holesCount: quoteItem.process === 'cnc_3axis' ? 5 : undefined,
    };

    // Create DFM report
    const dfmReport = await this.prisma.dFMReport.create({
      data: {
        quoteItemId: quoteItem.id,
        metrics: mockMetrics,
        issues: [],
        riskScore: 20,
      },
    });

    return dfmReport;
  }

  private convertMaterial(material: Material): any {
    return {
      ...material,
      density: material.density.toNumber(),
      co2eFactor: material.co2eFactor.toNumber(),
      pricePerUom: material.pricePerUom.toNumber(),
      recycledPercent: material.recycledPercent?.toNumber(),
    };
  }

  private convertMachine(machine: Machine): any {
    return {
      ...machine,
      hourlyRate: machine.hourlyRate.toNumber(),
    };
  }
}