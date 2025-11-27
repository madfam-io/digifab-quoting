/**
 * Types for Cotiza Studio API client
 */

export interface CotizaConfig {
  /** Base URL of the Cotiza API (default: https://api.cotiza.studio) */
  baseUrl: string;
  /** API key for authentication (optional for guest quotes) */
  apiKey?: string;
  /** Tenant ID for multi-tenant operations */
  tenantId?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

export type ManufacturingProcess = 'fdm' | 'sla' | 'cnc' | 'laser';
export type Material =
  | 'pla'
  | 'abs'
  | 'petg'
  | 'tpu'
  | 'nylon'
  | 'resin_standard'
  | 'resin_tough'
  | 'aluminum'
  | 'steel'
  | 'acrylic'
  | 'wood'
  | 'mdf';

export type OptimizationObjective = 'cost' | 'speed' | 'quality';
export type Currency = 'USD' | 'MXN' | 'EUR';

export interface QuoteItemInput {
  /** File reference (URL or upload ID) */
  fileUrl?: string;
  /** File name for display */
  fileName: string;
  /** Manufacturing process */
  process: ManufacturingProcess;
  /** Material selection */
  material: Material;
  /** Quantity to produce */
  quantity: number;
  /** Part dimensions in mm (optional - auto-detected from file) */
  dimensions?: {
    x: number;
    y: number;
    z: number;
  };
  /** Volume in mm³ (optional - auto-calculated) */
  volume?: number;
  /** Additional notes */
  notes?: string;
}

export interface CreateQuoteInput {
  /** Quote currency */
  currency: Currency;
  /** Optimization objective */
  optimization: OptimizationObjective;
  /** Quote items */
  items: QuoteItemInput[];
  /** Customer email for guest quotes */
  email?: string;
  /** Customer name */
  customerName?: string;
}

export interface QuoteItem {
  id: string;
  fileName: string;
  process: ManufacturingProcess;
  material: Material;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  estimatedTime: number; // hours
  dimensions?: {
    x: number;
    y: number;
    z: number;
  };
  volume?: number;
}

export interface Quote {
  id: string;
  reference: string;
  status: 'draft' | 'pending' | 'calculated' | 'accepted' | 'expired';
  currency: Currency;
  optimization: OptimizationObjective;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  estimatedDelivery: string; // ISO date
  validUntil: string; // ISO date
  createdAt: string;
  updatedAt: string;
}

export interface InstantQuoteInput {
  /** Manufacturing process */
  process: ManufacturingProcess;
  /** Material selection */
  material: Material;
  /** Quantity */
  quantity: number;
  /** Part volume in mm³ */
  volume: number;
  /** Currency for pricing */
  currency?: Currency;
}

export interface InstantQuoteResult {
  unitPrice: number;
  totalPrice: number;
  currency: Currency;
  estimatedHours: number;
  estimatedDays: number;
  breakdown: {
    materialCost: number;
    machineCost: number;
    laborCost: number;
    overhead: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class CotizaError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'CotizaError';
  }
}

// ============================================================================
// Checkout Types (via Janua Payment Gateway)
// ============================================================================

export type PaymentProvider = 'conekta' | 'stripe' | 'polar';
export type PaymentMethod = 'card' | 'oxxo' | 'spei' | 'bank_transfer';

export interface CheckoutConfig {
  /** Janua API URL for payment processing */
  januaApiUrl?: string;
  /** Janua publishable key */
  januaPublishableKey?: string;
  /** Default success URL after payment */
  successUrl?: string;
  /** Default cancel URL if payment is abandoned */
  cancelUrl?: string;
}

export interface CheckoutLineItem {
  /** Item name */
  name: string;
  /** Item description */
  description?: string;
  /** Amount in smallest currency unit (cents/centavos) */
  amount: number;
  /** Currency code */
  currency: Currency;
  /** Quantity */
  quantity: number;
  /** Optional image URL */
  imageUrl?: string;
}

export interface CreateCheckoutInput {
  /** Quote ID from Cotiza */
  quoteId: string;
  /** Customer email */
  customerEmail: string;
  /** Customer name */
  customerName?: string;
  /** Line items for checkout */
  lineItems: CheckoutLineItem[];
  /** Success URL after payment */
  successUrl?: string;
  /** Cancel URL if payment is abandoned */
  cancelUrl?: string;
  /** Preferred payment provider (auto-selected if not specified) */
  preferredProvider?: PaymentProvider;
  /** Country code for provider selection (auto-detected if not specified) */
  countryCode?: string;
  /** Additional metadata */
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  /** Session ID */
  id: string;
  /** Checkout URL to redirect user */
  url: string;
  /** Payment provider used */
  provider: PaymentProvider;
  /** Available payment methods for this session */
  paymentMethods: PaymentMethod[];
  /** Session expiration time */
  expiresAt: string;
  /** Session status */
  status: 'open' | 'complete' | 'expired';
}

export interface CheckoutResult {
  /** Whether payment was successful */
  success: boolean;
  /** Session ID */
  sessionId: string;
  /** Payment status */
  status: 'paid' | 'pending' | 'failed' | 'canceled';
  /** Order ID if payment succeeded */
  orderId?: string;
  /** Error message if payment failed */
  error?: string;
  /** Payment method used */
  paymentMethod?: PaymentMethod;
  /** Provider used */
  provider: PaymentProvider;
}

export interface PaymentMethodInfo {
  /** Payment method type */
  type: PaymentMethod;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Icon/logo URL */
  iconUrl?: string;
  /** Whether this is available for the current currency/country */
  available: boolean;
  /** Processing time estimate */
  processingTime?: string;
}

export interface ProviderInfo {
  /** Selected provider */
  provider: PaymentProvider;
  /** Currency for this provider */
  currency: Currency;
  /** Available payment methods */
  paymentMethods: PaymentMethodInfo[];
  /** Country code used for selection */
  countryCode: string;
}
