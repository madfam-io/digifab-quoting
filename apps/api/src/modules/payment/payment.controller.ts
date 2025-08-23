import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  UseGuards,
  Request,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantContext } from '../../common/decorators/tenant.decorator';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';
import { PaymentSessionResponseDto } from './dto/payment-session-response.dto';
import { Request as ExpressRequest } from 'express';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeService: StripeService,
  ) {}

  @Post('quotes/:quoteId/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session for quote payment' })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully',
    type: PaymentSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 400, description: 'Quote not approved or already paid' })
  async createCheckoutSession(
    @Param('quoteId') quoteId: string,
    @TenantContext() tenantId: string,
  ): Promise<PaymentSessionResponseDto> {
    return this.paymentService.createPaymentSession(quoteId, tenantId);
  }

  @Get('quotes/:quoteId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment status for a quote' })
  @ApiResponse({
    status: 200,
    description: 'Payment status retrieved successfully',
  })
  async getPaymentStatus(@Param('quoteId') quoteId: string, @TenantContext() tenantId: string) {
    return this.paymentService.getPaymentStatus(quoteId, tenantId);
  }

  @Post('webhooks/stripe')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() rawBody: Buffer,
    @Request() req: RawBodyRequest<ExpressRequest>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      // Construct and verify the webhook event
      const event = this.stripeService.constructWebhookEvent(req.rawBody || rawBody, signature);

      // Extract tenant ID from metadata
      const metadata = (event.data.object as any).metadata;
      const tenantId = metadata?.tenantId;

      if (!tenantId) {
        throw new BadRequestException('Missing tenant ID in webhook metadata');
      }

      // Process the webhook event
      await this.paymentService.handleWebhookEvent(event, tenantId);

      return { received: true };
    } catch (error) {
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }
  }
}
