import { 
  Injectable, 
  BadRequestException, 
  NotFoundException,
  Logger 
} from '@nestjs/common';
import { QuoteStatus, Currency } from '@madfam/shared';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { AddQuoteItemDto } from './dto/add-quote-item.dto';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { UpdateQuoteItemDto } from './dto/update-quote-item.dto';
import { AcceptQuoteDto } from './dto/accept-quote.dto';
import { QuoteRepository } from './repositories/quote.repository';
import { QuoteCalculationService } from './services/quote-calculation.service';
import { FileService } from '../files/files.service';
import { CacheService } from '@/cache/cache.service';
import { 
  validateQuoteObjective,
  validateCreateQuoteItem,
  validateAcceptQuote 
} from './schemas/quote.schema';
import { Decimal } from 'decimal.js';
import { Quote, QuoteItem } from '@prisma/client';

interface QuoteWithItems extends Quote {
  items: QuoteItem[];
  customer?: any;
}

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly calculationService: QuoteCalculationService,
    private readonly fileService: FileService,
    private readonly cacheService: CacheService,
  ) {}

  async create(
    tenantId: string,
    customerId: string,
    dto: CreateQuoteDto,
  ): Promise<Quote> {
    try {
      // Validate objective weights if provided
      if (dto.objective) {
        validateQuoteObjective(dto.objective);
      }

      // Check for existing draft quote
      const existingDraft = await this.quoteRepository.findDraftQuote(
        customerId,
        tenantId,
      );

      if (existingDraft && !dto.force) {
        return existingDraft;
      }

      // Generate quote number
      const reference = await this.quoteRepository.generateQuoteNumber(tenantId);

      // Get validity period from tenant config
      const validityDays = await this.getTenantQuoteValidity(tenantId);
      const validityUntil = new Date();
      validityUntil.setDate(validityUntil.getDate() + validityDays);

      // Create quote
      const quote = await this.quoteRepository.create({
        tenantId,
        customerId,
        reference,
        currency: dto.currency || Currency.MXN,
        objective: dto.objective || { cost: 0.5, lead: 0.3, green: 0.2 },
        validityUntil,
        status: QuoteStatus.DRAFT,
        metadata: dto.metadata,
      });

      this.logger.log(`Created quote ${quote.reference} for customer ${customerId}`);
      return quote;
    } catch (error) {
      this.logger.error('Failed to create quote', error);
      throw new BadRequestException('Failed to create quote');
    }
  }

  async findAll(
    tenantId: string,
    options: {
      customerId?: string;
      status?: QuoteStatus;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    try {
      const result = await this.quoteRepository.findPaginated(tenantId, {
        page: options.page,
        limit: options.limit,
        filters: {
          customerId: options.customerId,
          status: options.status,
          dateFrom: options.dateFrom,
          dateTo: options.dateTo,
          search: options.search,
        },
        include: {
          customer: true,
          _count: {
            select: { items: true },
          },
        },
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to find quotes', error);
      throw error;
    }
  }

  async findOne(tenantId: string, id: string): Promise<QuoteWithItems> {
    const cacheKey = `quote:${tenantId}:${id}`;
    
    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const quote = await this.quoteRepository.findById(id, tenantId, {
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
          company: true,
        },
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, quote, 300);

    return quote as QuoteWithItems;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateQuoteDto,
  ): Promise<Quote> {
    const quote = await this.findOne(tenantId, id);

    // Validate status allows updates
    if (!this.canUpdateQuote(quote.status as QuoteStatus)) {
      throw new BadRequestException('Cannot update quote in current status');
    }

    // Validate objective if provided
    if (dto.objective) {
      validateQuoteObjective(dto.objective);
    }

    const updated = await this.quoteRepository.update(id, tenantId, {
      objective: dto.objective,
      metadata: dto.metadata,
      notes: dto.notes,
    });

    // Invalidate cache
    await this.cacheService.delete(`quote:${tenantId}:${id}`);

    return updated;
  }

  async addItem(
    tenantId: string,
    quoteId: string,
    dto: AddQuoteItemDto,
  ): Promise<QuoteItem> {
    try {
      const quote = await this.findOne(tenantId, quoteId);

      if (quote.status !== QuoteStatus.DRAFT) {
        throw new BadRequestException('Cannot add items to non-draft quote');
      }

      // Validate item data
      const validatedItem = validateCreateQuoteItem(dto);

      // Verify file belongs to tenant and is analyzed
      const file = await this.fileService.findOne(dto.fileId, tenantId);
      if (!file.analyzedAt) {
        throw new BadRequestException('File must be analyzed before adding to quote');
      }

      // Create quote item
      const item = await this.quoteRepository.transaction(async (tx) => {
        const quoteItem = await tx.quoteItem.create({
          data: {
            quoteId,
            process: validatedItem.process,
            material: validatedItem.material,
            quantity: validatedItem.quantity,
            selections: validatedItem.selections as any,
            notes: validatedItem.notes,
            status: 'pending',
          },
        });

        // Associate file with quote item
        await tx.file.update({
          where: { id: dto.fileId },
          data: { quoteItemId: quoteItem.id },
        });

        return quoteItem;
      });

      // Invalidate cache
      await this.cacheService.delete(`quote:${tenantId}:${quoteId}`);

      this.logger.log(`Added item to quote ${quote.reference}`);
      return item;
    } catch (error) {
      this.logger.error('Failed to add quote item', error);
      throw error;
    }
  }

  async calculate(
    tenantId: string,
    quoteId: string,
    dto: CalculateQuoteDto,
  ): Promise<any> {
    try {
      const quote = await this.findOne(tenantId, quoteId);

      // Update objective if provided
      if (dto.objective) {
        validateQuoteObjective(dto.objective);
        await this.quoteRepository.update(quoteId, tenantId, {
          objective: dto.objective,
        });
      }

      // Calculate pricing
      const result = await this.calculationService.calculateQuote(
        quoteId,
        tenantId,
        dto.items,
      );

      // Update quote items and totals
      await this.quoteRepository.transaction(async (tx) => {
        // Batch update all items
        await this.quoteRepository.batchUpdateItems(
          quoteId,
          tenantId,
          result.itemsToUpdate,
        );

        // Update quote with totals and status
        await tx.quote.update({
          where: { id: quoteId },
          data: {
            status: result.warnings.length > 0 
              ? QuoteStatus.NEEDS_REVIEW 
              : QuoteStatus.AUTO_QUOTED,
            subtotal: result.totals.subtotal.toNumber(),
            tax: result.totals.tax.toNumber(),
            shipping: result.totals.shipping.toNumber(),
            grandTotal: result.totals.grandTotal.toNumber(),
            sustainability: this.calculateSustainabilitySummary(
              result.itemsToUpdate,
            ),
          },
        });
      });

      // Invalidate cache
      await this.cacheService.delete(`quote:${tenantId}:${quoteId}`);

      // Return updated quote
      const updatedQuote = await this.findOne(tenantId, quoteId);

      return {
        quote: updatedQuote,
        warnings: result.warnings.length > 0 ? result.warnings : undefined,
      };
    } catch (error) {
      this.logger.error('Failed to calculate quote', error);
      throw error;
    }
  }

  async accept(
    tenantId: string,
    quoteId: string,
    customerId: string,
    dto: AcceptQuoteDto,
  ): Promise<{ orderId: string; paymentUrl?: string }> {
    try {
      const quote = await this.findOne(tenantId, quoteId);

      // Validate ownership
      if (quote.customerId !== customerId) {
        throw new BadRequestException('Unauthorized to accept this quote');
      }

      // Validate status
      if (!this.canAcceptQuote(quote.status as QuoteStatus)) {
        throw new BadRequestException('Quote cannot be accepted in current status');
      }

      // Check validity
      if (new Date(quote.validityUntil) < new Date()) {
        throw new BadRequestException('Quote has expired');
      }

      // Validate accept data
      const validatedData = validateAcceptQuote(dto);

      // Verify accepted items belong to quote
      const itemIds = new Set(validatedData.acceptedItems);
      const validItems = quote.items.filter(item => itemIds.has(item.id));
      
      if (validItems.length !== validatedData.acceptedItems.length) {
        throw new BadRequestException('Invalid item selection');
      }

      // Create order from quote
      const order = await this.createOrderFromQuote(
        quote,
        validItems,
        validatedData.shippingAddress,
      );

      // Update quote status
      await this.quoteRepository.update(quoteId, tenantId, {
        status: QuoteStatus.ACCEPTED,
        acceptedAt: new Date(),
      });

      // Invalidate cache
      await this.cacheService.delete(`quote:${tenantId}:${quoteId}`);

      this.logger.log(`Quote ${quote.reference} accepted, order ${order.id} created`);

      return {
        orderId: order.id,
        paymentUrl: order.paymentUrl,
      };
    } catch (error) {
      this.logger.error('Failed to accept quote', error);
      throw error;
    }
  }

  async cancel(
    tenantId: string,
    quoteId: string,
    reason?: string,
  ): Promise<Quote> {
    const quote = await this.findOne(tenantId, quoteId);

    if (!this.canCancelQuote(quote.status as QuoteStatus)) {
      throw new BadRequestException('Quote cannot be cancelled in current status');
    }

    const updated = await this.quoteRepository.update(quoteId, tenantId, {
      status: QuoteStatus.CANCELLED,
      cancelledAt: new Date(),
      metadata: {
        ...(quote.metadata as any || {}),
        cancellationReason: reason,
      },
    });

    // Invalidate cache
    await this.cacheService.delete(`quote:${tenantId}:${quoteId}`);

    this.logger.log(`Quote ${quote.reference} cancelled`);
    return updated;
  }

  async expire(tenantId: string): Promise<number> {
    const expiredQuotes = await this.quoteRepository.findExpiredQuotes(tenantId);

    let count = 0;
    for (const quote of expiredQuotes) {
      try {
        await this.quoteRepository.updateStatus(
          quote.id,
          tenantId,
          QuoteStatus.EXPIRED,
        );
        count++;
      } catch (error) {
        this.logger.error(`Failed to expire quote ${quote.reference}`, error);
      }
    }

    if (count > 0) {
      this.logger.log(`Expired ${count} quotes for tenant ${tenantId}`);
    }

    return count;
  }

  // Helper methods
  private canUpdateQuote(status: QuoteStatus): boolean {
    return [
      QuoteStatus.DRAFT,
      QuoteStatus.SUBMITTED,
      QuoteStatus.NEEDS_REVIEW,
    ].includes(status);
  }

  private canAcceptQuote(status: QuoteStatus): boolean {
    return [
      QuoteStatus.QUOTED,
      QuoteStatus.AUTO_QUOTED,
    ].includes(status);
  }

  private canCancelQuote(status: QuoteStatus): boolean {
    return ![
      QuoteStatus.ACCEPTED,
      QuoteStatus.CANCELLED,
      QuoteStatus.EXPIRED,
    ].includes(status);
  }

  private async getTenantQuoteValidity(tenantId: string): Promise<number> {
    const cacheKey = `tenant-validity:${tenantId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // TODO: Load from tenant settings
    const validityDays = 14;
    
    await this.cacheService.set(cacheKey, validityDays, 3600);
    return validityDays;
  }

  private calculateSustainabilitySummary(items: any[]): any {
    if (items.length === 0) return null;

    let totalCo2e = new Decimal(0);
    let totalEnergy = new Decimal(0);
    let scoreSum = 0;
    let validScores = 0;

    for (const item of items) {
      const sustainability = item.data.sustainability;
      if (sustainability) {
        if (sustainability.co2eKg) {
          totalCo2e = totalCo2e.plus(sustainability.co2eKg);
        }
        if (sustainability.energyKwh) {
          totalEnergy = totalEnergy.plus(sustainability.energyKwh);
        }
        if (sustainability.score) {
          scoreSum += sustainability.score;
          validScores++;
        }
      }
    }

    return {
      score: validScores > 0 ? Math.round(scoreSum / validScores) : 0,
      co2eKg: totalCo2e.toNumber(),
      energyKwh: totalEnergy.toNumber(),
    };
  }

  private async createOrderFromQuote(
    quote: QuoteWithItems,
    items: QuoteItem[],
    shippingAddress: any,
  ): Promise<any> {
    // TODO: Implement order creation
    // This would be handled by OrderService
    return {
      id: 'ORD-' + Date.now(),
      paymentUrl: 'https://payment.example.com',
    };
  }
}