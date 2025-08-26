import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UsageTrackingService, UsageEventType } from './services/usage-tracking.service';
import { PricingTierService } from './services/pricing-tier.service';
import { StripeService } from '@/modules/payment/stripe.service';

export interface UsageLimit {
  eventType: UsageEventType;
  limit: number;
  used: number;
  remaining: number;
  overageRate: number;
}

export interface CostEstimate {
  baseCost: number;
  overageCost: number;
  totalCost: number;
  breakdown: Record<UsageEventType, { quantity: number; cost: number; overage?: number }>;
  recommendedTier?: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  period: string;
  baseFee: number;
  usageCost: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue' | 'failed';
  dueDate: Date;
  paidAt?: Date;
  stripeInvoiceId?: string;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usageTracking: UsageTrackingService,
    private readonly pricingTierService: PricingTierService,
    private readonly stripeService: StripeService,
  ) {}

  async getUsageLimits(tenantId: string): Promise<UsageLimit[]> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { billingPlan: true },
    });

    if (!tenant?.billingPlan) {
      throw new BadRequestException('No billing plan found for tenant');
    }

    const includedQuotas = tenant.billingPlan.includedQuotas as Record<UsageEventType, number>;
    const overageRates = tenant.billingPlan.overageRates as Record<UsageEventType, number>;
    
    const currentUsage = await this.usageTracking.getUsageSummary(tenantId);
    
    const limits: UsageLimit[] = [];

    Object.values(UsageEventType).forEach(eventType => {
      const limit = includedQuotas[eventType] || 0;
      const used = currentUsage.events[eventType] || 0;
      const remaining = Math.max(0, limit - used);
      const overageRate = overageRates[eventType] || 0;

      limits.push({
        eventType,
        limit,
        used,
        remaining,
        overageRate,
      });
    });

    return limits;
  }

  async upgradeTier(
    tenantId: string,
    tierName: string,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<{ subscriptionId: string; checkoutUrl?: string }> {
    const tier = await this.pricingTierService.getTier(tierName);
    if (!tier) {
      throw new BadRequestException(`Pricing tier '${tierName}' not found`);
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { billingPlan: true },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    // Calculate prorated amount if upgrading mid-cycle
    const amount = billingCycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice;
    
    if (amount > 0) {
      // Create Stripe subscription
      const subscription = await this.stripeService.createSubscription({
        customer: tenant.stripeCustomerId,
        priceId: this.getStripePriceId(tier.name, billingCycle),
        metadata: {
          tenantId,
          tierName,
          billingCycle,
        },
      });

      // Update tenant billing plan
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          billingPlanId: tier.id,
          stripeSubscriptionId: subscription.id,
        },
      });

      return {
        subscriptionId: subscription.id,
        checkoutUrl: subscription.latest_invoice ? 
          (subscription.latest_invoice as any).hosted_invoice_url : 
          undefined,
      };
    } else {
      // Free tier - just update the plan
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          billingPlanId: tier.id,
          stripeSubscriptionId: null,
        },
      });

      return {
        subscriptionId: 'free',
      };
    }
  }

  async getInvoices(tenantId: string, limit: number = 20, offset: number = 0): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return invoices.map(invoice => ({
      id: invoice.id,
      tenantId: invoice.tenantId,
      period: invoice.period,
      baseFee: invoice.baseFee ? Number(invoice.baseFee) : 0,
      usageCost: invoice.usageCost ? Number(invoice.usageCost) : 0,
      totalAmount: Number(invoice.totalAmount),
      status: invoice.status as Invoice['status'],
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt || undefined,
      stripeInvoiceId: invoice.stripeInvoiceId || undefined,
    }));
  }

  async getInvoice(tenantId: string, invoiceId: string): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { 
        id: invoiceId,
        tenantId,
      },
    });

    if (!invoice) return null;

    return {
      id: invoice.id,
      tenantId: invoice.tenantId,
      period: invoice.period,
      baseFee: invoice.baseFee ? Number(invoice.baseFee) : 0,
      usageCost: invoice.usageCost ? Number(invoice.usageCost) : 0,
      totalAmount: Number(invoice.totalAmount),
      status: invoice.status as Invoice['status'],
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt || undefined,
      stripeInvoiceId: invoice.stripeInvoiceId || undefined,
    };
  }

  async createPaymentSession(tenantId: string, invoiceId: string): Promise<{ sessionUrl: string }> {
    const invoice = await this.getInvoice(tenantId, invoiceId);
    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    if (invoice.status === 'paid') {
      throw new BadRequestException('Invoice is already paid');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { users: { take: 1 } },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    const session = await this.stripeService.createCheckoutSession({
      quoteId: invoiceId, // Using invoice ID as quote ID for billing context
      customerEmail: tenant.users[0]?.email || 'noreply@cotiza.studio', // Get first user's email
      lineItems: [{
        name: `Invoice for ${invoice.period}`,
        description: `Cotiza Studio Quoting Service - ${invoice.period}`,
        amount: Number(invoice.totalAmount) * 100, // Convert to cents
        currency: 'usd',
        quantity: 1,
      }],
      metadata: {
        tenantId,
        invoiceId,
        type: 'billing_invoice',
      },
      successUrl: `${process.env.FRONTEND_URL}/billing/success?invoice=${invoiceId}`,
      cancelUrl: `${process.env.FRONTEND_URL}/billing/invoices`,
    });

    return {
      sessionUrl: session.url,
    };
  }

  async estimateCosts(tenantId: string, projectedUsage: Record<string, number>): Promise<CostEstimate> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { billingPlan: true },
    });

    if (!tenant?.billingPlan) {
      throw new BadRequestException('No billing plan found for tenant');
    }

    const includedQuotas = tenant.billingPlan.includedQuotas as Record<UsageEventType, number>;
    const overageRates = tenant.billingPlan.overageRates as Record<UsageEventType, number>;

    const baseCost = Number(tenant.billingPlan.monthlyPrice) || 0;
    let overageCost = 0;
    const breakdown: Record<string, { quantity: number; cost: number; overage?: number }> = {};

    Object.entries(projectedUsage).forEach(([eventTypeStr, quantity]) => {
      const eventType = eventTypeStr as UsageEventType;
      const included = includedQuotas[eventType] || 0;
      const overage = Math.max(0, quantity - included);
      const overageRate = overageRates[eventType] || 0;
      const eventOverageCost = overage * overageRate;

      overageCost += eventOverageCost;

      breakdown[eventType] = {
        quantity,
        cost: eventOverageCost,
        overage: overage > 0 ? overage : undefined,
      };
    });

    const totalCost = baseCost + overageCost;

    // Suggest tier upgrade if significant overage
    let recommendedTier: string | undefined;
    if (overageCost > baseCost * 0.5) {
      const allTiers = await this.pricingTierService.getAllTiers();
      const currentTierIndex = allTiers.findIndex(t => t.id === tenant.billingPlan!.id);
      
      if (currentTierIndex >= 0 && currentTierIndex < allTiers.length - 1) {
        recommendedTier = allTiers[currentTierIndex + 1].name;
      }
    }

    return {
      baseCost,
      overageCost,
      totalCost,
      breakdown,
      recommendedTier,
    };
  }

  async generateInvoice(tenantId: string, period: string): Promise<Invoice> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { billingPlan: true },
    });

    if (!tenant?.billingPlan) {
      throw new BadRequestException('No billing plan found for tenant');
    }

    const _unused_usage = await this.usageTracking.getUsageSummary(tenantId, period);
    const overageCost = await this.pricingTierService.calculateOverageCost(tenantId, period);
    const baseFee = Number(tenant.billingPlan.monthlyPrice) || 0;
    const totalAmount = baseFee + overageCost;

    // Check if invoice already exists
    const existingInvoice = await this.prisma.invoice.findFirst({
      where: {
        tenantId,
        period,
      },
    });

    if (existingInvoice) {
      return {
        id: existingInvoice.id,
        tenantId: existingInvoice.tenantId,
        period: existingInvoice.period,
        baseFee: existingInvoice.baseFee ? Number(existingInvoice.baseFee) : 0,
        usageCost: existingInvoice.usageCost ? Number(existingInvoice.usageCost) : 0,
        totalAmount: Number(existingInvoice.totalAmount),
        status: existingInvoice.status as Invoice['status'],
        dueDate: existingInvoice.dueDate,
        paidAt: existingInvoice.paidAt || undefined,
        stripeInvoiceId: existingInvoice.stripeInvoiceId || undefined,
      };
    }

    // Create new invoice
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment term

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        period,
        baseFee,
        usageCost: overageCost,
        totalAmount,
        status: 'pending',
        dueDate,
      },
    });

    // Create Stripe invoice if amount > 0
    if (totalAmount > 0) {
      const stripeInvoice = await this.stripeService.createInvoice({
        customer: tenant.stripeCustomerId,
        amount: totalAmount,
        currency: 'usd',
        description: `Cotiza Studio Quoting - ${period}`,
        metadata: {
          tenantId,
          invoiceId: invoice.id,
          period,
        },
      });

      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          stripeInvoiceId: stripeInvoice.id,
        },
      });
    }

    this.logger.log(`Generated invoice for tenant ${tenantId}, period ${period}, amount $${totalAmount}`);

    return {
      id: invoice.id,
      tenantId: invoice.tenantId,
      period: invoice.period,
      baseFee: invoice.baseFee ? Number(invoice.baseFee) : 0,
      usageCost: invoice.usageCost ? Number(invoice.usageCost) : 0,
      totalAmount: Number(invoice.totalAmount),
      status: invoice.status as Invoice['status'],
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt || undefined,
      stripeInvoiceId: invoice.stripeInvoiceId || undefined,
    };
  }

  private getStripePriceId(tierName: string, billingCycle: 'monthly' | 'yearly'): string {
    const priceMap = {
      free: {
        monthly: '',
        yearly: '',
      },
      pro: {
        monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
        yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
      },
      enterprise: {
        monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || '',
        yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || '',
      },
    };

    return priceMap[tierName]?.[billingCycle] || '';
  }

  async handleStripeWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
      case 'subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled Stripe webhook event: ${event.type}`);
    }
  }

  private async handleInvoicePaymentSucceeded(stripeInvoice: any): Promise<void> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id },
    });

    if (invoice) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      });

      this.logger.log(`Invoice ${invoice.id} marked as paid`);
    }
  }

  private async handleInvoicePaymentFailed(stripeInvoice: any): Promise<void> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id },
    });

    if (invoice) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'failed',
        },
      });

      this.logger.warn(`Invoice ${invoice.id} payment failed`);
    }
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (tenant) {
      // Downgrade to free tier
      const freeTier = await this.pricingTierService.getTier('free');
      if (freeTier) {
        await this.prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            billingPlanId: freeTier.id,
            stripeSubscriptionId: null,
          },
        });

        this.logger.log(`Tenant ${tenant.id} downgraded to free tier`);
      }
    }
  }
}