import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Decimal from 'decimal.js';

@Injectable()
export class QuoteBusinessRulesService {
  private readonly taxRate: Decimal;
  private readonly freeShippingThreshold: Decimal;
  private readonly standardShippingRate: Decimal;
  private readonly expressShippingRate: Decimal;
  private readonly quoteValidityDays: number;
  private readonly rushOrderUpcharge: Decimal;
  private readonly minimumOrderValue: Decimal;

  constructor(private configService: ConfigService) {
    // Load business rules from configuration
    this.taxRate = new Decimal(this.configService.get('business.taxRate', 0.16));
    this.freeShippingThreshold = new Decimal(
      this.configService.get('business.freeShippingThreshold', 1000),
    );
    this.standardShippingRate = new Decimal(
      this.configService.get('business.standardShippingRate', 150),
    );
    this.expressShippingRate = new Decimal(
      this.configService.get('business.expressShippingRate', 300),
    );
    this.quoteValidityDays = this.configService.get('business.quoteValidityDays', 14);
    this.rushOrderUpcharge = new Decimal(this.configService.get('business.rushOrderUpcharge', 0.5));
    this.minimumOrderValue = new Decimal(this.configService.get('business.minimumOrderValue', 100));
  }

  /**
   * Calculate tax amount based on subtotal
   */
  calculateTax(subtotal: Decimal, taxExempt: boolean = false): Decimal {
    if (taxExempt) {
      return new Decimal(0);
    }
    return subtotal.mul(this.taxRate).toDecimalPlaces(2);
  }

  /**
   * Calculate shipping cost based on subtotal and shipping method
   */
  calculateShipping(
    subtotal: Decimal,
    shippingMethod: 'standard' | 'express' = 'standard',
    weight?: number,
  ): Decimal {
    // Free shipping for orders above threshold
    if (subtotal.gte(this.freeShippingThreshold)) {
      return new Decimal(0);
    }

    // Base rate based on shipping method
    let shippingCost =
      shippingMethod === 'express' ? this.expressShippingRate : this.standardShippingRate;

    // Add weight-based surcharge if applicable
    if (weight && weight > 10) {
      const weightSurcharge = new Decimal(weight - 10).mul(5); // $5 per kg over 10kg
      shippingCost = shippingCost.plus(weightSurcharge);
    }

    return shippingCost.toDecimalPlaces(2);
  }

  /**
   * Calculate quote validity date
   */
  calculateQuoteValidityDate(rushOrder: boolean = false): Date {
    const date = new Date();
    const days = rushOrder ? Math.floor(this.quoteValidityDays / 2) : this.quoteValidityDays;
    date.setDate(date.getDate() + days);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  /**
   * Generate a unique quote number
   */
  generateQuoteNumber(tenantCode: string, sequence: number): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const seq = String(sequence).padStart(4, '0');

    return `${tenantCode.toUpperCase()}-Q${year}${month}-${seq}`;
  }

  /**
   * Calculate rush order upcharge
   */
  calculateRushOrderUpcharge(subtotal: Decimal, isRushOrder: boolean): Decimal {
    if (!isRushOrder) {
      return new Decimal(0);
    }
    return subtotal.mul(this.rushOrderUpcharge).toDecimalPlaces(2);
  }

  /**
   * Validate if order meets minimum value
   */
  validateMinimumOrderValue(subtotal: Decimal): boolean {
    return subtotal.gte(this.minimumOrderValue);
  }

  /**
   * Calculate volume discount based on quantity and subtotal
   */
  calculateVolumeDiscount(quantity: number, subtotal: Decimal): Decimal {
    let discountPercent = new Decimal(0);

    // Quantity-based discounts
    if (quantity >= 100) {
      discountPercent = new Decimal(0.15); // 15% off
    } else if (quantity >= 50) {
      discountPercent = new Decimal(0.1); // 10% off
    } else if (quantity >= 10) {
      discountPercent = new Decimal(0.05); // 5% off
    }

    // Additional discount for large orders
    if (subtotal.gte(5000)) {
      discountPercent = discountPercent.plus(0.05); // Additional 5% off
    }

    // Cap maximum discount at 20%
    if (discountPercent.gt(0.2)) {
      discountPercent = new Decimal(0.2);
    }

    return subtotal.mul(discountPercent).toDecimalPlaces(2);
  }

  /**
   * Calculate final totals for a quote
   */
  calculateTotals(params: {
    subtotal: Decimal;
    quantity: number;
    shippingMethod?: 'standard' | 'express';
    isRushOrder?: boolean;
    taxExempt?: boolean;
    weight?: number;
  }): {
    subtotal: Decimal;
    discount: Decimal;
    rushCharge: Decimal;
    tax: Decimal;
    shipping: Decimal;
    grandTotal: Decimal;
  } {
    const {
      subtotal,
      quantity,
      shippingMethod = 'standard',
      isRushOrder = false,
      taxExempt = false,
      weight,
    } = params;

    // Calculate components
    const discount = this.calculateVolumeDiscount(quantity, subtotal);
    const discountedSubtotal = subtotal.minus(discount);
    const rushCharge = this.calculateRushOrderUpcharge(discountedSubtotal, isRushOrder);
    const taxableAmount = discountedSubtotal.plus(rushCharge);
    const tax = this.calculateTax(taxableAmount, taxExempt);
    const shipping = this.calculateShipping(discountedSubtotal, shippingMethod, weight);

    const grandTotal = taxableAmount.plus(tax).plus(shipping);

    return {
      subtotal,
      discount,
      rushCharge,
      tax,
      shipping,
      grandTotal,
    };
  }
}
