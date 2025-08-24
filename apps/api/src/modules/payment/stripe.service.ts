import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    this.webhookSecret = webhookSecret;
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    });
  }

  async createCheckoutSession(params: {
    quoteId: string;
    customerEmail: string;
    lineItems: Array<{
      name: string;
      description: string;
      amount: number; // in cents
      currency: string;
      quantity: number;
    }>;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: params.lineItems.map((item) => ({
          price_data: {
            currency: item.currency,
            product_data: {
              name: item.name,
              description: item.description,
            },
            unit_amount: item.amount,
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.customerEmail,
        metadata: {
          quoteId: params.quoteId,
          ...params.metadata,
        },
        payment_intent_data: {
          metadata: {
            quoteId: params.quoteId,
            ...params.metadata,
          },
        },
      });

      this.logger.log(`Created checkout session ${session.id} for quote ${params.quoteId}`);
      return session;
    } catch (error) {
      this.logger.error(
        `Failed to create checkout session: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async createPaymentIntent(params: {
    amount: number; // in cents
    currency: string;
    customerEmail: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency,
        receipt_email: params.customerEmail,
        description: params.description,
        metadata: params.metadata,
      });

      this.logger.log(`Created payment intent ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        `Failed to create payment intent: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items'],
    });
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch (error) {
      this.logger.error(
        `Webhook signature verification failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount, // If not specified, refunds the full amount
      });

      this.logger.log(`Created refund ${refund.id} for payment intent ${paymentIntentId}`);
      return refund;
    } catch (error) {
      this.logger.error(
        `Failed to create refund: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
