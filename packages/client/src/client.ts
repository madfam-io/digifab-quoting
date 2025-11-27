/**
 * Cotiza Studio API Client
 *
 * Provides programmatic access to the digifab-quoting API for:
 * - Creating and managing quotes
 * - Instant price calculations
 * - File uploads for 3D models
 */

import {
  CotizaConfig,
  CreateQuoteInput,
  Quote,
  InstantQuoteInput,
  InstantQuoteResult,
  CotizaError,
  ApiError,
  CheckoutConfig,
  CreateCheckoutInput,
  CheckoutSession,
  CheckoutResult,
  ProviderInfo,
  PaymentMethod,
} from './types';

const DEFAULT_CONFIG: Partial<CotizaConfig> = {
  baseUrl: 'https://api.cotiza.studio',
  timeout: 30000,
};

export class CotizaClient {
  private config: CotizaConfig;
  private checkoutConfig: CheckoutConfig;

  constructor(config: Partial<CotizaConfig> = {}, checkoutConfig: CheckoutConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as CotizaConfig;
    this.checkoutConfig = {
      januaApiUrl:
        checkoutConfig.januaApiUrl ||
        process.env.NEXT_PUBLIC_JANUA_API_URL ||
        'https://api.janua.dev',
      januaPublishableKey:
        checkoutConfig.januaPublishableKey || process.env.NEXT_PUBLIC_JANUA_PUBLISHABLE_KEY,
      successUrl: checkoutConfig.successUrl,
      cancelUrl: checkoutConfig.cancelUrl,
    };
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    if (this.config.tenantId) {
      headers['X-Tenant-ID'] = this.config.tenantId;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          code: 'UNKNOWN_ERROR',
          message: response.statusText,
        }));
        throw new CotizaError(error.code, error.message, error.details);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof CotizaError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new CotizaError('TIMEOUT', 'Request timed out');
      }

      throw new CotizaError(
        'NETWORK_ERROR',
        error instanceof Error ? error.message : 'Network error',
      );
    }
  }

  /**
   * Create a new quote
   */
  async createQuote(input: CreateQuoteInput): Promise<Quote> {
    return this.request<Quote>('POST', '/v1/quotes', input);
  }

  /**
   * Get a quote by ID
   */
  async getQuote(quoteId: string): Promise<Quote> {
    return this.request<Quote>('GET', `/v1/quotes/${quoteId}`);
  }

  /**
   * Get a quote by reference number
   */
  async getQuoteByReference(reference: string): Promise<Quote> {
    return this.request<Quote>('GET', `/v1/quotes/reference/${reference}`);
  }

  /**
   * Calculate instant quote without creating a record
   * Useful for real-time pricing widgets
   */
  async calculateInstant(input: InstantQuoteInput): Promise<InstantQuoteResult> {
    return this.request<InstantQuoteResult>('POST', '/v1/quotes/instant', input);
  }

  /**
   * Upload a 3D file for analysis
   * Returns file ID and detected dimensions/volume
   */
  async uploadFile(file: File): Promise<{
    fileId: string;
    fileName: string;
    dimensions: { x: number; y: number; z: number };
    volume: number;
    surfaceArea: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.config.baseUrl}/v1/files/upload`;

    const headers: Record<string, string> = {};

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    if (this.config.tenantId) {
      headers['X-Tenant-ID'] = this.config.tenantId;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        code: 'UPLOAD_ERROR',
        message: response.statusText,
      }));
      throw new CotizaError(error.code, error.message, error.details);
    }

    return response.json();
  }

  /**
   * Get available materials for a process
   */
  async getMaterials(process: string): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      pricePerUnit: number;
      unit: string;
    }>
  > {
    return this.request('GET', `/v1/pricing/materials?process=${process}`);
  }

  /**
   * Get available processes
   */
  async getProcesses(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      minLeadTime: number;
      maxLeadTime: number;
    }>
  > {
    return this.request('GET', '/v1/pricing/processes');
  }

  // ==========================================================================
  // Checkout Methods (via Janua Payment Gateway)
  // ==========================================================================

  /**
   * Get available payment provider and methods for a given country/currency
   * Uses Janua's intelligent routing to select optimal provider
   */
  async getProviderInfo(countryCode?: string): Promise<ProviderInfo> {
    const params = new URLSearchParams();
    if (countryCode) params.append('country', countryCode);

    const response = await this.januaRequest<{
      provider: 'conekta' | 'stripe' | 'polar';
      currency: string;
      payment_methods: Array<{
        type: string;
        name: string;
        description: string;
        icon_url?: string;
        available: boolean;
        processing_time?: string;
      }>;
      country_code: string;
    }>('GET', `/api/v1/billing/provider-info?${params.toString()}`);

    return {
      provider: response.provider,
      currency: response.currency as any,
      countryCode: response.country_code,
      paymentMethods: response.payment_methods.map((pm) => ({
        type: pm.type as PaymentMethod,
        name: pm.name,
        description: pm.description,
        iconUrl: pm.icon_url,
        available: pm.available,
        processingTime: pm.processing_time,
      })),
    };
  }

  /**
   * Create a checkout session via Janua Payment Gateway
   * Automatically selects optimal provider based on country/currency
   *
   * @example
   * ```typescript
   * const session = await client.createCheckout({
   *   quoteId: 'quote_123',
   *   customerEmail: 'user@example.com',
   *   lineItems: [{ name: 'FDM Print', amount: 15000, currency: 'MXN', quantity: 1 }],
   *   successUrl: 'https://primavera3d.com/orders/success',
   * });
   * // Redirect to session.url
   * ```
   */
  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession> {
    const response = await this.januaRequest<{
      session_id: string;
      checkout_url: string;
      provider: string;
      payment_methods: string[];
      expires_at: string;
      status: string;
    }>('POST', '/api/v1/payments/checkout', {
      quote_id: input.quoteId,
      customer_email: input.customerEmail,
      customer_name: input.customerName,
      line_items: input.lineItems.map((item) => ({
        name: item.name,
        description: item.description,
        amount: item.amount,
        currency: item.currency.toLowerCase(),
        quantity: item.quantity,
        image_url: item.imageUrl,
      })),
      success_url: input.successUrl || this.checkoutConfig.successUrl,
      cancel_url: input.cancelUrl || this.checkoutConfig.cancelUrl,
      preferred_provider: input.preferredProvider,
      country_code: input.countryCode,
      metadata: {
        ...input.metadata,
        source: 'cotiza-client',
        quote_id: input.quoteId,
      },
    });

    return {
      id: response.session_id,
      url: response.checkout_url,
      provider: response.provider as any,
      paymentMethods: response.payment_methods as PaymentMethod[],
      expiresAt: response.expires_at,
      status: response.status as any,
    };
  }

  /**
   * Get checkout session status
   */
  async getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
    const response = await this.januaRequest<{
      session_id: string;
      checkout_url: string;
      provider: string;
      payment_methods: string[];
      expires_at: string;
      status: string;
    }>('GET', `/api/v1/payments/checkout/${sessionId}`);

    return {
      id: response.session_id,
      url: response.checkout_url,
      provider: response.provider as any,
      paymentMethods: response.payment_methods as PaymentMethod[],
      expiresAt: response.expires_at,
      status: response.status as any,
    };
  }

  /**
   * Get checkout result after payment
   */
  async getCheckoutResult(sessionId: string): Promise<CheckoutResult> {
    const response = await this.januaRequest<{
      success: boolean;
      session_id: string;
      status: string;
      order_id?: string;
      error?: string;
      payment_method?: string;
      provider: string;
    }>('GET', `/api/v1/payments/checkout/${sessionId}/result`);

    return {
      success: response.success,
      sessionId: response.session_id,
      status: response.status as any,
      orderId: response.order_id,
      error: response.error,
      paymentMethod: response.payment_method as PaymentMethod | undefined,
      provider: response.provider as any,
    };
  }

  /**
   * Create checkout from an existing quote
   * Convenience method that fetches quote details and creates checkout
   */
  async checkoutQuote(
    quoteId: string,
    customerEmail: string,
    options: {
      customerName?: string;
      successUrl?: string;
      cancelUrl?: string;
      countryCode?: string;
    } = {},
  ): Promise<CheckoutSession> {
    // Get quote details
    const quote = await this.getQuote(quoteId);

    // Convert quote items to checkout line items
    const lineItems = quote.items.map((item) => ({
      name: item.fileName,
      description: `${item.process.toUpperCase()} - ${item.material} - Qty: ${item.quantity}`,
      amount: Math.round(item.totalPrice * 100), // Convert to cents/centavos
      currency: quote.currency,
      quantity: 1, // Already calculated total
    }));

    return this.createCheckout({
      quoteId,
      customerEmail,
      customerName: options.customerName,
      lineItems,
      successUrl: options.successUrl,
      cancelUrl: options.cancelUrl,
      countryCode: options.countryCode,
    });
  }

  // ==========================================================================
  // Janua API Request Helper
  // ==========================================================================

  private async januaRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.checkoutConfig.januaApiUrl}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.checkoutConfig.januaPublishableKey) {
      headers['X-Janua-Key'] = this.checkoutConfig.januaPublishableKey;
    }

    // Pass tenant context if available
    if (this.config.tenantId) {
      headers['X-Tenant-ID'] = this.config.tenantId;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 30000);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          code: 'PAYMENT_ERROR',
          message: response.statusText,
        }));
        throw new CotizaError(error.code, error.message, error.details);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof CotizaError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new CotizaError('TIMEOUT', 'Payment request timed out');
      }

      throw new CotizaError(
        'PAYMENT_ERROR',
        error instanceof Error ? error.message : 'Payment gateway error',
      );
    }
  }
}

/**
 * Create a configured Cotiza client instance
 */
export function createCotizaClient(
  config?: Partial<CotizaConfig>,
  checkoutConfig?: CheckoutConfig,
): CotizaClient {
  return new CotizaClient(config, checkoutConfig);
}
