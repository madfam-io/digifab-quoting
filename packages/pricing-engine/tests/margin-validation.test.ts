import { describe, it, expect } from '@jest/globals';
import { PricingEngine } from '../src/engine';
import { PricingInput } from '../src/types';
import { ProcessType } from '@madfam/shared';
import { Decimal } from 'decimal.js';

describe('Margin Validation', () => {
  const engine = new PricingEngine();

  const createInput = (overrides: Partial<PricingInput> = {}): PricingInput => ({
    process: ProcessType.FFF,
    geometry: {
      volumeCm3: 100,
      surfaceAreaCm2: 200,
      bboxMm: { x: 100, y: 100, z: 100 },
    },
    material: {
      id: 'pla',
      name: 'PLA',
      costPerKg: new Decimal(25),
      densityGCm3: 1.24,
      category: 'thermoplastic',
    },
    machine: {
      id: 'prusa',
      name: 'Prusa',
      costPerHour: new Decimal(10),
      setupMinutes: 15,
      powerW: 150,
    },
    quantity: 1,
    tenantConfig: {
      markupPercent: 50,
      overheadPercent: 20,
      laborCostPerHour: new Decimal(25),
      currency: 'MXN',
      minOrderValue: new Decimal(100),
    },
    selections: {
      infill: 35,
    },
    ...overrides,
  });

  it('should maintain minimum 50% markup', () => {
    const input = createInput();
    const result = engine.calculate(input);
    
    const totalCost = result.costBreakdown.material
      .plus(result.costBreakdown.machine)
      .plus(result.costBreakdown.energy)
      .plus(result.costBreakdown.labor)
      .plus(result.costBreakdown.overhead);
    
    const actualMarkup = result.costBreakdown.margin.div(totalCost).mul(100);
    
    expect(actualMarkup.toNumber()).toBeGreaterThanOrEqual(50);
  });

  it('should apply correct margin for different processes', () => {
    const processes = [
      { type: ProcessType.FFF, expectedMin: 50 },
      { type: ProcessType.SLA, expectedMin: 50 },
      { type: ProcessType.CNC_3AXIS, expectedMin: 50 },
      { type: ProcessType.LASER_2D, expectedMin: 50 },
    ];

    processes.forEach(({ type, expectedMin }) => {
      const input = createInput({ process: type });
      const result = engine.calculate(input);
      
      const totalCost = result.costBreakdown.material
        .plus(result.costBreakdown.machine)
        .plus(result.costBreakdown.energy)
        .plus(result.costBreakdown.labor)
        .plus(result.costBreakdown.overhead);
      
      const actualMarkup = result.costBreakdown.margin.div(totalCost).mul(100);
      
      expect(actualMarkup.toNumber()).toBeGreaterThanOrEqual(expectedMin);
    });
  });

  it('should ensure profitability after volume discounts', () => {
    const quantities = [1, 10, 50, 100, 500];
    
    quantities.forEach(qty => {
      const input = createInput({ quantity: qty });
      const result = engine.calculate(input);
      
      // Calculate effective margin after discount
      const totalCost = result.costBreakdown.material
        .plus(result.costBreakdown.machine)
        .plus(result.costBreakdown.energy)
        .plus(result.costBreakdown.labor)
        .plus(result.costBreakdown.overhead);
      
      const netMargin = result.costBreakdown.margin.minus(result.costBreakdown.discount);
      const effectiveMarkup = netMargin.div(totalCost).mul(100);
      
      // Even with max 20% discount, should maintain at least 30% effective markup
      expect(effectiveMarkup.toNumber()).toBeGreaterThanOrEqual(30);
    });
  });

  it('should calculate correct total price', () => {
    const input = createInput();
    const result = engine.calculate(input);
    
    // Verify total calculation
    const expectedTotal = result.costBreakdown.material
      .plus(result.costBreakdown.machine)
      .plus(result.costBreakdown.energy)
      .plus(result.costBreakdown.labor)
      .plus(result.costBreakdown.overhead)
      .plus(result.costBreakdown.margin)
      .minus(result.costBreakdown.discount);
    
    expect(result.unitPrice.toNumber()).toBeCloseTo(expectedTotal.toNumber(), 2);
    expect(result.totalPrice.toNumber()).toBeCloseTo(
      expectedTotal.mul(input.quantity).toNumber(),
      2
    );
  });

  it('should enforce minimum order value', () => {
    const minOrderValues = [100, 500, 1000];
    
    minOrderValues.forEach(minValue => {
      const input = createInput({
        geometry: {
          volumeCm3: 0.1, // Very small part
          surfaceAreaCm2: 1,
          bboxMm: { x: 10, y: 10, z: 1 },
        },
        tenantConfig: {
          ...createInput().tenantConfig,
          minOrderValue: new Decimal(minValue),
        },
      });
      
      const result = engine.calculate(input);
      
      expect(result.totalPrice.toNumber()).toBeGreaterThanOrEqual(minValue);
    });
  });

  it('should handle multi-currency scenarios', () => {
    const currencies = ['MXN', 'USD', 'EUR'];
    
    currencies.forEach(currency => {
      const input = createInput({
        tenantConfig: {
          ...createInput().tenantConfig,
          currency,
        },
      });
      
      const result = engine.calculate(input);
      
      // Should calculate successfully regardless of currency
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(result.costBreakdown.margin.toNumber()).toBeGreaterThan(0);
    });
  });

  it('should validate cost breakdown totals', () => {
    const input = createInput();
    const result = engine.calculate(input);
    const breakdown = result.costBreakdown;
    
    // Subtotal should equal sum of base costs
    const expectedSubtotal = breakdown.material
      .plus(breakdown.machine)
      .plus(breakdown.energy)
      .plus(breakdown.labor);
    
    expect(breakdown.subtotal.toNumber()).toBeCloseTo(
      expectedSubtotal.toNumber(),
      2
    );
    
    // Total should include overhead and margin, minus discount
    const expectedTotal = expectedSubtotal
      .plus(breakdown.overhead)
      .plus(breakdown.margin)
      .minus(breakdown.discount);
    
    expect(breakdown.total.toNumber()).toBeCloseTo(
      expectedTotal.toNumber(),
      2
    );
  });
});