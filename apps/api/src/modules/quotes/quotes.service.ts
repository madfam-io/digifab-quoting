import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { QuoteCacheService } from '../redis/quote-cache.service';
import { Cacheable, CacheInvalidate } from '../redis/decorators/cache.decorator';
import { 
  Quote as PrismaQuote,
  QuoteItem as PrismaQuoteItem,
} from '@prisma/client';
import { 
  QuoteStatus,
  Currency,
  ProcessType,
} from '@madfam/shared';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { AddQuoteItemDto } from './dto/add-quote-item.dto';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Decimal } from 'decimal.js';

@Injectable()
export class QuotesService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
    private quoteCacheService: QuoteCacheService,
  ) {}

  async create(
    tenantId: string,
    customerId: string,
    dto: CreateQuoteDto,
  ): Promise<PrismaQuote> {
    const validityDays = 14; // TODO: Get from tenant config
    const validityUntil = new Date();
    validityUntil.setDate(validityUntil.getDate() + validityDays);

    // Generate unique quote number
    const quoteNumber = await this.generateQuoteNumber(tenantId);

    return this.prisma.quote.create({
      data: {
        tenantId,
        customerId,
        number: quoteNumber,
        currency: dto.currency,
        objective: dto.objective,
        validityUntil,
        status: QuoteStatus.DRAFT,
      },
    });
  }

  async findAll(
    tenantId: string,
    filters: {
      customerId?: string;
      status?: QuoteStatus;
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where = {
      tenantId,
      ...(filters.customerId && { customerId: filters.customerId }),
      ...(filters.status && { status: filters.status as string }),  // Cast enum to string for Prisma
    };

    const [items, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        include: {
          items: true,
          customer: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quote.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  @Cacheable({ prefix: 'quote:detail', ttl: 300 }) // Cache for 5 minutes
  async findOne(tenantId: string, id: string): Promise<any> {
    const quote = await this.prisma.quote.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        items: {
          include: {
            files: true,
            dfmReport: true,
          },
        },
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    return quote;
  }

  @CacheInvalidate('quote:detail:*')
  async update(
    tenantId: string,
    id: string,
    dto: UpdateQuoteDto,
  ): Promise<PrismaQuote> {
    const quote = await this.findOne(tenantId, id);

    if (quote.status !== QuoteStatus.DRAFT && quote.status !== QuoteStatus.SUBMITTED) {
      throw new BadRequestException('Cannot update quote in current status');
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        objective: dto.objective,
        metadata: dto.metadata,
      },
    });
  }

  async addItem(
    tenantId: string,
    quoteId: string,
    dto: AddQuoteItemDto,
  ): Promise<PrismaQuoteItem> {
    const quote = await this.findOne(tenantId, quoteId);

    if (quote.status !== QuoteStatus.DRAFT) {
      throw new BadRequestException('Cannot add items to non-draft quote');
    }

    // Verify file belongs to tenant
    const file = await this.prisma.file.findFirst({
      where: {
        id: dto.fileId,
        tenantId,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Create quote item
    const quoteItem = await this.prisma.quoteItem.create({
      data: {
        quoteId,
        name: dto.name || file.originalName,
        processCode: dto.process,
        quantity: dto.quantity,
        selections: dto.options,
      },
    });

    // Associate file with quote item
    await this.prisma.file.update({
      where: { id: dto.fileId },
      data: { quoteItemId: quoteItem.id },
    });

    // Return the item with relations loaded
    return this.prisma.quoteItem.findUnique({
      where: { id: quoteItem.id },
      include: {
        files: true,
      },
    }) as Promise<PrismaQuoteItem>;
  }

  async calculate(
    tenantId: string,
    quoteId: string,
    dto: CalculateQuoteDto,
  ): Promise<any> {
    const quote = await this.findOne(tenantId, quoteId);

    // Update objective if provided
    if (dto.objective) {
      await this.prisma.quote.update({
        where: { id: quoteId },
        data: { objective: dto.objective },
      });
    }

    // Get all quote items to calculate
    const itemsToCalculate = dto.items || quote.items;
    const calculatedItems = [];
    const errors = [];

    for (const item of itemsToCalculate) {
      try {
        // Get or create quote item
        let quoteItem;
        if (item.id) {
          quoteItem = await this.prisma.quoteItem.findFirst({
            where: { id: item.id, quoteId },
            include: { files: true, dfmReport: true },
          });
        } else {
          // Create new item
          quoteItem = await this.addItem(tenantId, quoteId, item);
        }

        // Try to get cached pricing result first
        const cacheKey = {
          fileHash: quoteItem.files[0]?.hash || '',
          service: quoteItem.process,
          material: quoteItem.selections?.material || 'default',
          quantity: quoteItem.quantity,
          options: quoteItem.selections,
        };

        const pricingResult = await this.quoteCacheService.getOrCalculateQuote(
          cacheKey,
          async () => {
            const result = await this.pricingService.calculateQuoteItem(
              tenantId,
              quoteItem.processCode as ProcessType,
              {}, // geometryMetrics - placeholder
              quoteItem.materialId || '',
              '', // machineId - placeholder
              quoteItem.selections,
              quoteItem.quantity,
              quote.objective,
            );
            return {
              pricing: {
                unitCost: result.unitPrice,
                totalCost: result.totalPrice,
                margin: result.costBreakdown.margin,
                finalPrice: result.totalPrice,
              },
              manufacturing: {
                estimatedTime: result.leadDays,
                machineCost: result.costBreakdown?.machine || 0,
                materialCost: result.costBreakdown?.material || 0,
              },
              timestamp: Date.now(),
            };
          },
        );

        // Update quote item with results
        const updatedItem = quoteItem ? await this.prisma.quoteItem.update({
          where: { id: quoteItem.id },
          data: {
            unitPrice: pricingResult.pricing.unitCost,
            totalPrice: pricingResult.pricing.totalCost,
            leadDays: pricingResult.manufacturing.estimatedTime,
            costBreakdown: {
              machine: pricingResult.manufacturing.machineCost,
              material: pricingResult.manufacturing.materialCost,
            },
            sustainability: {},
            flags: [],
          },
        }) : null;

        if (updatedItem) {
          calculatedItems.push(updatedItem);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        errors.push({
          itemId: item.id,
          error: errorMessage,
        });
      }
    }

    // Calculate totals
    const totals = this.calculateTotals(calculatedItems, quote.currency as Currency);

    // Update quote status and totals
    const updatedQuote = await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: errors.length > 0 ? QuoteStatus.NEEDS_REVIEW : QuoteStatus.AUTO_QUOTED,
        totals,
        sustainability: this.calculateSustainabilitySummary(calculatedItems),
      },
      include: {
        items: {
          include: {
            files: true,
            dfmReport: true,
          },
        },
      },
    });

    return {
      quote: updatedQuote,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async approve(tenantId: string, quoteId: string, customerId: string): Promise<PrismaQuote> {
    const quote = await this.findOne(tenantId, quoteId);

    if (quote.customerId !== customerId) {
      throw new BadRequestException('Unauthorized to approve this quote');
    }

    if (quote.status !== QuoteStatus.QUOTED && quote.status !== QuoteStatus.AUTO_QUOTED) {
      throw new BadRequestException('Quote cannot be approved in current status');
    }

    if (new Date(quote.validityUntil) < new Date()) {
      throw new BadRequestException('Quote has expired');
    }

    return this.prisma.quote.update({
      where: { id: quoteId },
      data: { status: QuoteStatus.APPROVED },
    });
  }

  @CacheInvalidate('quote:detail:*')
  async cancel(tenantId: string, quoteId: string): Promise<PrismaQuote> {
    const quote = await this.findOne(tenantId, quoteId);

    const allowedStatuses: QuoteStatus[] = [
      QuoteStatus.DRAFT,
      QuoteStatus.SUBMITTED,
      QuoteStatus.AUTO_QUOTED,
      QuoteStatus.QUOTED,
      QuoteStatus.NEEDS_REVIEW,
    ];
    if (!allowedStatuses.includes(quote.status as QuoteStatus)) {
      throw new BadRequestException('Quote cannot be cancelled in current status');
    }

    return this.prisma.quote.update({
      where: { id: quoteId },
      data: { status: QuoteStatus.CANCELLED },
    });
  }

  private calculateTotals(items: any[], currency: Currency): any {
    const subtotal = items.reduce(
      (sum, item) => sum.plus(new Decimal(item.totalPrice || 0)),
      new Decimal(0),
    );

    // TODO: Calculate tax based on tenant configuration
    const taxRate = new Decimal(0.16); // 16% IVA
    const tax = subtotal.mul(taxRate);

    // TODO: Calculate shipping
    const shipping = new Decimal(0);

    const grandTotal = subtotal.plus(tax).plus(shipping);

    return {
      subtotal: subtotal.toNumber(),
      tax: tax.toNumber(),
      shipping: shipping.toNumber(),
      grandTotal: grandTotal.toNumber(),
      currency,
    };
  }

  private calculateSustainabilitySummary(items: any[]): any {
    if (items.length === 0) return null;

    const totalCo2e = items.reduce(
      (sum, item) => sum.plus(new Decimal(item.sustainability?.co2eKg || 0)),
      new Decimal(0),
    );

    const avgScore = items.reduce(
      (sum, item) => sum + (item.sustainability?.score || 0),
      0,
    ) / items.length;

    const totalEnergyKwh = items.reduce(
      (sum, item) => sum.plus(new Decimal(item.sustainability?.energyKwh || 0)),
      new Decimal(0),
    );

    return {
      score: Math.round(avgScore),
      co2eKg: totalCo2e.toNumber(),
      energyKwh: totalEnergyKwh.toNumber(),
    };
  }

  private async generateQuoteNumber(tenantId: string): Promise<string> {
    // Get the current date components
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Get the count of quotes for this tenant in the current month
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const count = await this.prisma.quote.count({
      where: {
        tenantId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
    
    // Generate quote number in format: Q-YYYY-MM-XXXX
    const sequence = String(count + 1).padStart(4, '0');
    return `Q-${year}-${month}-${sequence}`;
  }
}