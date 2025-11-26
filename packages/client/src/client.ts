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
} from './types';

const DEFAULT_CONFIG: Partial<CotizaConfig> = {
  baseUrl: 'https://api.cotiza.studio',
  timeout: 30000,
};

export class CotizaClient {
  private config: CotizaConfig;

  constructor(config: Partial<CotizaConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as CotizaConfig;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
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
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );

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
        error instanceof Error ? error.message : 'Network error'
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
}

/**
 * Create a configured Cotiza client instance
 */
export function createCotizaClient(config?: Partial<CotizaConfig>): CotizaClient {
  return new CotizaClient(config);
}
