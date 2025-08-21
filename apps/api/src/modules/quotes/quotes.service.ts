import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { PricingService } from '../pricing/pricing.service';
import { 
  Quote, 
  QuoteStatus, 
  QuoteObjective,
  ProcessType,
  Currency,
  Quote as PrismaQuote,
  QuoteItem as PrismaQuoteItem,
} from '@prisma/client';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { AddQuoteItemDto } from './dto/add-quote-item.dto';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Decimal } from 'decimal.js';

@Injectable()
export class QuotesService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
    private pricingService: PricingService,
  ) {}

  async create(
    tenantId: string,
    customerId: string,
    dto: CreateQuoteDto,
  ): Promise<PrismaQuote> {
    const validityDays = 14; // TODO: Get from tenant config
    const validityUntil = new Date();
    validityUntil.setDate(validityUntil.getDate() + validityDays);

    return this.prisma.quote.create({
      data: {
        tenantId,
        customerId,
        currency: dto.currency,
        objective: dto.objective,
        validityUntil,
        status: 'draft',
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
      ...(filters.status && { status: filters.status }),
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

  async update(
    tenantId: string,
    id: string,
    dto: UpdateQuoteDto,
  ): Promise<PrismaQuote> {
    const quote = await this.findOne(tenantId, id);

    if (quote.status !== 'draft' && quote.status !== 'submitted') {
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

    if (quote.status !== 'draft') {
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
        process: dto.process,
        quantity: dto.quantity,
        selections: dto.options,
      },
    });

    // Associate file with quote item
    await this.prisma.file.update({
      where: { id: dto.fileId },
      data: { quoteItemId: quoteItem.id },
    });

    return quoteItem;
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

        // Calculate pricing
        const pricingResult = await this.pricingService.calculateQuoteItem(
          tenantId,
          quoteItem,
          quote.objective as any,
        );

        // Update quote item with results
        const updatedItem = await this.prisma.quoteItem.update({
          where: { id: quoteItem.id },
          data: {
            unitPrice: pricingResult.unitPrice.toNumber(),
            totalPrice: pricingResult.totalPrice.toNumber(),
            leadDays: pricingResult.leadDays,
            costBreakdown: pricingResult.costBreakdown,
            sustainability: pricingResult.sustainability,
            flags: pricingResult.warnings,
          },
        });

        calculatedItems.push(updatedItem);
      } catch (error) {
        errors.push({
          itemId: item.id,
          error: error.message,
        });
      }
    }

    // Calculate totals
    const totals = this.calculateTotals(calculatedItems, quote.currency as Currency);

    // Update quote status and totals
    const updatedQuote = await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: errors.length > 0 ? 'needs_review' : 'auto_quoted',
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

    if (quote.status !== 'quoted' && quote.status !== 'auto_quoted') {
      throw new BadRequestException('Quote cannot be approved in current status');
    }

    if (new Date(quote.validityUntil) < new Date()) {
      throw new BadRequestException('Quote has expired');
    }

    return this.prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'approved' },
    });
  }

  async cancel(tenantId: string, quoteId: string): Promise<PrismaQuote> {
    const quote = await this.findOne(tenantId, quoteId);

    const allowedStatuses: QuoteStatus[] = ['draft', 'submitted', 'auto_quoted', 'quoted', 'needs_review'];
    if (!allowedStatuses.includes(quote.status as QuoteStatus)) {
      throw new BadRequestException('Quote cannot be cancelled in current status');
    }

    return this.prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'cancelled' },
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
}