import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import {
  JobType,
  QuoteCalculationJobData,
  JobResult,
  JobProgress,
} from '../interfaces/job.interface';
import { LoggerService } from '@/common/logger/logger.service';
import { PrismaService } from '@/prisma/prisma.service';
import { PricingService } from '@/modules/pricing/pricing.service';
import { Decimal } from 'decimal.js';
import { getErrorMessage, toError } from '@/common/utils/error-handling';

interface CancellableJobData extends QuoteCalculationJobData {
  cancelled?: boolean;
}

interface PricingConfig {
  defaultMargin?: number;
  minimumMargin?: number;
  rushOrderRate?: number;
  taxRate?: number;
  quoteValidityDays?: number;
  volumeDiscountThresholds?: Record<string, number>;
  overheadRate?: number;
}

interface QuoteCalculationResult {
  quoteId: string;
  items: Array<{
    id: string;
    fileId: string;
    unitPrice: number;
    totalPrice: number;
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    margin: number;
    leadTime: number;
  }>;
  summary: {
    subtotal: number;
    rushFee?: number;
    volumeDiscount?: number;
    tax: number;
    total: number;
    currency: string;
    validUntil: Date;
  };
  pricing: {
    basePrice: number;
    adjustments: Array<{
      type: string;
      amount: number;
      reason: string;
    }>;
    profitMargin: number;
  };
}

@Processor(JobType.QUOTE_CALCULATION)
@Injectable()
export class QuoteCalculationProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  @Process()
  async handleQuoteCalculation(
    job: Job<QuoteCalculationJobData>,
  ): Promise<JobResult<QuoteCalculationResult>> {
    const startTime = Date.now();
    const { quoteId, items, rushOrder, currency = 'MXN', tenantId } = job.data;

    try {
      this.logger.log(`Starting quote calculation for ${quoteId}`, {
        jobId: job.id,
        tenantId,
        itemCount: items.length,
      });

      // Check if job was cancelled
      if ((job.data as CancellableJobData).cancelled) {
        throw new Error('Job was cancelled');
      }

      await this.updateProgress(job, 10, 'Loading quote data');

      // Load quote and related data
      const quote = await this.loadQuoteWithItems(quoteId, tenantId);
      if (!quote) {
        throw new Error(`Quote ${quoteId} not found`);
      }

      await this.updateProgress(job, 20, 'Validating files and materials');

      // Validate all files are analyzed
      await this.validateFilesAnalyzed(items, tenantId);

      // Get pricing configuration
      const pricingConfig = await this.pricingService.getTenantPricingConfig(tenantId);

      await this.updateProgress(job, 30, 'Calculating item prices');

      // Calculate price for each item
      const calculatedItems: QuoteCalculationResult['items'] = [];
      let currentProgress = 30;
      const progressPerItem = 50 / items.length;

      for (const item of items) {
        if ((job.data as CancellableJobData).cancelled) {
          throw new Error('Job was cancelled');
        }

        const calculatedItem = await this.calculateItemPrice(item, pricingConfig, tenantId);

        calculatedItems.push(calculatedItem);

        currentProgress += progressPerItem;
        await this.updateProgress(
          job,
          Math.round(currentProgress),
          `Calculated price for item ${calculatedItems.length}/${items.length}`,
        );
      }

      await this.updateProgress(job, 80, 'Calculating quote summary');

      // Calculate quote summary
      const summary = await this.calculateQuoteSummary(
        calculatedItems,
        rushOrder || false,
        currency,
        pricingConfig,
      );

      await this.updateProgress(job, 90, 'Saving calculation results');

      // Save results to database
      await this.saveCalculationResults(quoteId, calculatedItems, summary, tenantId);

      await this.updateProgress(job, 100, 'Quote calculation completed');

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: {
          quoteId,
          items: calculatedItems,
          summary,
          pricing: {
            basePrice: summary.subtotal,
            adjustments: this.getAdjustments(summary),
            profitMargin: pricingConfig.defaultMargin,
          },
        },
        duration,
      };
    } catch (error) {
      this.logger.error(`Quote calculation failed for ${quoteId}`, toError(error));

      return {
        success: false,
        error: {
          code: 'QUOTE_CALCULATION_FAILED',
          message: getErrorMessage(error),
          details: error,
        },
        duration: Date.now() - startTime,
      };
    }
  }

  @OnQueueActive()
  onActive(job: Job<QuoteCalculationJobData>) {
    this.logger.log(`Quote calculation job ${job.id} started`, {
      quoteId: job.data.quoteId,
      tenantId: job.data.tenantId,
    });
  }

  @OnQueueCompleted()
  onComplete(job: Job<QuoteCalculationJobData>, result: JobResult<QuoteCalculationResult>) {
    this.logger.log(`Quote calculation job ${job.id} completed`, {
      quoteId: job.data.quoteId,
      tenantId: job.data.tenantId,
      success: result.success,
      duration: result.duration,
    });
  }

  @OnQueueFailed()
  onFailed(job: Job<QuoteCalculationJobData>, err: Error) {
    this.logger.error(`Quote calculation job ${job.id} failed`, toError(err));
  }

  private async updateProgress(
    job: Job<QuoteCalculationJobData>,
    percentage: number,
    message: string,
  ): Promise<void> {
    const progress: JobProgress = {
      percentage,
      message,
      step: this.getStepFromPercentage(percentage),
      metadata: {
        quoteId: job.data.quoteId,
        itemsProcessed: this.getItemsProcessed(percentage, job.data.items.length),
      },
    };

    await job.progress(progress);
    await job.log(`${message} (${percentage}%)`);
  }

  private getStepFromPercentage(percentage: number): string {
    if (percentage <= 20) return 'loading-data';
    if (percentage <= 30) return 'validating';
    if (percentage <= 80) return 'calculating-prices';
    if (percentage <= 90) return 'calculating-summary';
    return 'saving-results';
  }

  private getItemsProcessed(percentage: number, totalItems: number): number {
    if (percentage <= 30) return 0;
    if (percentage >= 80) return totalItems;

    const itemProgress = (percentage - 30) / 50;
    return Math.floor(itemProgress * totalItems);
  }

  private async loadQuoteWithItems(quoteId: string, tenantId: string) {
    return this.prisma.quote.findUnique({
      where: {
        id: quoteId,
        tenantId,
      },
      include: {
        items: {
          include: {
            files: {
              include: {
                fileAnalysis: true,
              },
            },
            // Process data included via join
          },
        },
        customer: true,
      },
    });
  }

  private async validateFilesAnalyzed(
    items: QuoteCalculationJobData['items'],
    tenantId: string,
  ): Promise<void> {
    const fileIds = items.map((item) => item.fileId);

    const files = await this.prisma.file.findMany({
      where: {
        id: { in: fileIds },
        tenantId,
      },
      include: {
        fileAnalysis: true,
      },
    });

    const unanalyzedFiles = files.filter((f) => !f.fileAnalysis);
    if (unanalyzedFiles.length > 0) {
      throw new Error(`Files not analyzed: ${unanalyzedFiles.map((f) => f.filename).join(', ')}`);
    }
  }

  private async calculateItemPrice(
    item: QuoteCalculationJobData['items'][0],
    pricingConfig: PricingConfig,
    tenantId: string,
  ): Promise<QuoteCalculationResult['items'][0]> {
    // Get file analysis data
    const fileAnalysis = await this.prisma.fileAnalysis.findUnique({
      where: {
        fileId: item.fileId,
      },
    });

    if (!fileAnalysis) {
      throw new Error(`File analysis not found for file ${item.fileId}`);
    }

    // Get material and process pricing
    const [material, process] = await Promise.all([
      this.prisma.material.findFirst({
        where: {
          code: item.material,
          tenantId,
        },
      }),
      this.prisma.manufacturingProcess.findFirst({
        where: {
          code: item.process,
          tenantId,
        },
      }),
    ]);

    if (!material || !process) {
      throw new Error('Material or process not found');
    }

    // Calculate base costs
    const volume = fileAnalysis.volume ? new Decimal(fileAnalysis.volume.toString()).toNumber() : 0;
    const materialCost = new Decimal(volume)
      .mul(material.density?.toString() || '1')
      .mul(material.costPerKg?.toString() || '0')
      .toNumber();

    const setupCost = new Decimal(process.setupCost?.toString() || '0').toNumber();
    const machineTime = this.estimateMachineTime(
      volume,
      process.code,
      fileAnalysis.complexity?.toString() || 'moderate',
    );
    const laborCost = new Decimal(machineTime)
      .mul(process.hourlyRate?.toString() || '0')
      .toNumber();

    // Calculate overhead
    const overheadRate = pricingConfig.overheadRate || 0.15;
    const overheadCost = new Decimal(materialCost + laborCost).mul(overheadRate).toNumber();

    // Calculate margin
    const marginRate = this.getMarginRate(item.quantity, fileAnalysis.complexity, pricingConfig);
    const totalCost = materialCost + laborCost + overheadCost + setupCost;
    const margin = new Decimal(totalCost).mul(marginRate).toNumber();

    // Calculate unit and total prices
    const unitPrice = new Decimal(totalCost + margin).div(item.quantity).toNumber();
    const totalPrice = new Decimal(unitPrice).mul(item.quantity).toNumber();

    // Estimate lead time
    const leadTime = this.estimateLeadTime(machineTime * item.quantity, process.code);

    return {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileId: item.fileId,
      unitPrice: Math.round(unitPrice * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      materialCost: Math.round(materialCost * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      overheadCost: Math.round(overheadCost * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      leadTime,
    };
  }

  private estimateMachineTime(volume: number, processCode: string, complexity: string): number {
    // Base time estimates (hours per cm³)
    const baseRates = {
      FFF: 0.001,
      SLA: 0.0008,
      CNC_3AXIS: 0.002,
      LASER_2D: 0.0005,
    };

    const complexityMultipliers = {
      simple: 1,
      moderate: 1.3,
      complex: 1.8,
    };

    const baseRate = baseRates[processCode as keyof typeof baseRates] || 0.001;
    const multiplier = complexityMultipliers[complexity as keyof typeof complexityMultipliers] || 1;

    return volume * baseRate * multiplier;
  }

  private getMarginRate(quantity: number, complexity: string, pricingConfig: PricingConfig): number {
    let baseMargin = pricingConfig.defaultMargin || 0.3;

    // Volume discount
    if (quantity >= 100) {
      baseMargin *= 0.8;
    } else if (quantity >= 50) {
      baseMargin *= 0.9;
    }

    // Complexity adjustment
    if (complexity === 'complex') {
      baseMargin *= 1.2;
    } else if (complexity === 'simple') {
      baseMargin *= 0.9;
    }

    return Math.max(baseMargin, pricingConfig.minimumMargin || 0.15);
  }

  private estimateLeadTime(totalMachineTime: number, processCode: string): number {
    // Base lead times in days
    const baseLeadTimes = {
      FFF: 2,
      SLA: 3,
      CNC_3AXIS: 5,
      LASER_2D: 2,
    };

    const baseDays = baseLeadTimes[processCode as keyof typeof baseLeadTimes] || 3;
    const productionDays = Math.ceil(totalMachineTime / 8); // 8 hours per day

    return baseDays + productionDays;
  }

  private async calculateQuoteSummary(
    items: QuoteCalculationResult['items'],
    rushOrder: boolean,
    currency: string,
    pricingConfig: PricingConfig,
  ): Promise<QuoteCalculationResult['summary']> {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    let rushFee = 0;
    if (rushOrder) {
      rushFee = subtotal * (pricingConfig.rushOrderRate || 0.25);
    }

    // Volume discount
    let volumeDiscount = 0;
    const totalQuantity = items.reduce((sum, _item) => sum + 1, 0); // Simplified
    if (totalQuantity >= 100) {
      volumeDiscount = subtotal * 0.1;
    } else if (totalQuantity >= 50) {
      volumeDiscount = subtotal * 0.05;
    }

    const taxableAmount = subtotal + rushFee - volumeDiscount;
    const taxRate = pricingConfig.taxRate || 0.16; // 16% IVA in Mexico
    const tax = taxableAmount * taxRate;

    const total = taxableAmount + tax;

    const validityDays = pricingConfig.quoteValidityDays || 14;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      rushFee: rushFee > 0 ? Math.round(rushFee * 100) / 100 : undefined,
      volumeDiscount: volumeDiscount > 0 ? Math.round(volumeDiscount * 100) / 100 : undefined,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      currency,
      validUntil,
    };
  }

  private async saveCalculationResults(
    quoteId: string,
    items: QuoteCalculationResult['items'],
    summary: QuoteCalculationResult['summary'],
    tenantId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Update quote with calculated values
      await tx.quote.update({
        where: {
          id: quoteId,
          tenantId,
        },
        data: {
          status: 'CALCULATED',
          subtotal: summary.subtotal,
          tax: summary.tax,
          total: summary.total,
          currency: summary.currency,
          validUntil: summary.validUntil,
          metadata: {
            rushFee: summary.rushFee,
            volumeDiscount: summary.volumeDiscount,
            calculatedAt: new Date(),
          },
        },
      });

      // Update quote items with calculated prices
      for (const item of items) {
        await tx.quoteItem.updateMany({
          where: {
            quoteId,
            fileId: item.fileId,
          },
          data: {
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            leadTime: item.leadTime,
            metadata: {
              materialCost: item.materialCost,
              laborCost: item.laborCost,
              overheadCost: item.overheadCost,
              margin: item.margin,
            },
          },
        });
      }
    });
  }

  private getAdjustments(summary: QuoteCalculationResult['summary']) {
    const adjustments = [];

    if (summary.rushFee) {
      adjustments.push({
        type: 'rush-order',
        amount: summary.rushFee,
        reason: 'Rush order processing',
      });
    }

    if (summary.volumeDiscount) {
      adjustments.push({
        type: 'volume-discount',
        amount: -summary.volumeDiscount,
        reason: 'Volume discount applied',
      });
    }

    adjustments.push({
      type: 'tax',
      amount: summary.tax,
      reason: 'Sales tax',
    });

    return adjustments;
  }
}
