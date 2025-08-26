import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/common/enums';
import { BillingService } from './billing.service';
import { UsageTrackingService } from './services/usage-tracking.service';
import { PricingTierService, PricingTier } from './services/pricing-tier.service';
import { TenantContextService } from '@/modules/tenant/tenant-context.service';

@Controller('billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly usageTracking: UsageTrackingService,
    private readonly pricingTierService: PricingTierService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Get('usage')
  @ApiOperation({ summary: 'Get current usage statistics' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Current usage summary',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            tenantId: { type: 'string' },
            period: { type: 'string' },
            events: { type: 'object' },
            totalCost: { type: 'number' },
            billingTier: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiQuery({ name: 'period', required: false, description: 'Billing period (YYYY-MM)' })
  async getUsage(@Query('period') period?: string) {
    const tenantId = this.tenantContext.getTenantId();
    const usage = await this.usageTracking.getUsageSummary(tenantId, period);

    return {
      success: true,
      data: usage,
    };
  }

  @Get('usage/limits')
  @ApiOperation({ summary: 'Get usage limits and remaining quotas' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Usage limits by event type',
  })
  async getUsageLimits() {
    const tenantId = this.tenantContext.getTenantId();
    const limits = await this.billingService.getUsageLimits(tenantId);

    return {
      success: true,
      data: limits,
    };
  }

  @Get('tiers')
  @ApiOperation({ summary: 'Get all available pricing tiers' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Available pricing tiers',
  })
  async getPricingTiers(): Promise<{ success: boolean; data: PricingTier[] }> {
    const tiers = await this.pricingTierService.getAllTiers();

    return {
      success: true,
      data: tiers,
    };
  }

  @Get('tiers/:tierName')
  @ApiOperation({ summary: 'Get specific pricing tier details' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Pricing tier details',
  })
  async getPricingTier(@Param('tierName') tierName: string) {
    const tier = await this.pricingTierService.getTier(tierName);

    if (!tier) {
      return {
        success: false,
        error: {
          code: 'TIER_NOT_FOUND',
          message: `Pricing tier '${tierName}' not found`,
        },
      };
    }

    return {
      success: true,
      data: tier,
    };
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade to a different pricing tier' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Upgrade initiated successfully',
  })
  async upgradeTier(@Body() body: { tierName: string; billingCycle: 'monthly' | 'yearly' }) {
    const tenantId = this.tenantContext.getTenantId();
    const result = await this.billingService.upgradeTier(tenantId, body.tierName, body.billingCycle);

    return {
      success: true,
      data: result,
    };
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get billing invoices' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Billing invoices',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of invoices to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  async getInvoices(
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0'
  ) {
    const tenantId = this.tenantContext.getTenantId();
    const invoices = await this.billingService.getInvoices(
      tenantId,
      parseInt(limit),
      parseInt(offset)
    );

    return {
      success: true,
      data: invoices,
    };
  }

  @Get('invoice/:invoiceId')
  @ApiOperation({ summary: 'Get specific invoice details' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Invoice details',
  })
  async getInvoice(@Param('invoiceId') invoiceId: string) {
    const tenantId = this.tenantContext.getTenantId();
    const invoice = await this.billingService.getInvoice(tenantId, invoiceId);

    return {
      success: true,
      data: invoice,
    };
  }

  @Post('invoice/:invoiceId/pay')
  @ApiOperation({ summary: 'Pay an outstanding invoice' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Payment initiated',
  })
  async payInvoice(@Param('invoiceId') invoiceId: string) {
    const tenantId = this.tenantContext.getTenantId();
    const paymentSession = await this.billingService.createPaymentSession(tenantId, invoiceId);

    return {
      success: true,
      data: paymentSession,
    };
  }

  @Get('estimate')
  @ApiOperation({ summary: 'Estimate costs for projected usage' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Cost estimate',
  })
  async estimateCosts(@Query() projectedUsage: Record<string, string>) {
    const tenantId = this.tenantContext.getTenantId();
    
    // Convert string values to numbers
    const usage: Record<string, number> = {};
    Object.entries(projectedUsage).forEach(([key, value]) => {
      usage[key] = parseInt(value) || 0;
    });

    const estimate = await this.billingService.estimateCosts(tenantId, usage);

    return {
      success: true,
      data: estimate,
    };
  }

  // Admin endpoints
  @Post('admin/tiers')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create/update pricing tiers (Admin only)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Pricing tier created/updated',
  })
  async createPricingTier(@Body() _tierData: Partial<PricingTier>) {
    await this.pricingTierService.createDefaultTiers();

    return {
      success: true,
      message: 'Default pricing tiers created/updated',
    };
  }

  @Get('admin/usage/:tenantId')
  @Roles(Role.ADMIN, Role.SUPPORT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get usage for any tenant (Admin/Support only)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Tenant usage summary',
  })
  async getTenantUsage(
    @Param('tenantId') tenantId: string,
    @Query('period') period?: string
  ) {
    const usage = await this.usageTracking.getUsageSummary(tenantId, period);

    return {
      success: true,
      data: usage,
    };
  }

  @Post('admin/usage/:tenantId/reset')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Reset tenant usage (Admin only)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Usage reset successfully',
  })
  async resetTenantUsage(
    @Param('tenantId') tenantId: string,
    @Query('period') period?: string
  ) {
    await this.usageTracking.resetUsage(tenantId, period);

    return {
      success: true,
      message: 'Usage reset successfully',
    };
  }
}