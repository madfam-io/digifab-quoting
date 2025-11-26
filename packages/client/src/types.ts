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
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CotizaError';
  }
}
