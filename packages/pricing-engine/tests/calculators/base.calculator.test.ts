import { describe, it, expect, beforeEach } from '@jest/globals';
import { BasePricingCalculator } from '../../src/calculators/base.calculator';
import { PricingInput, PricingResult } from '../../src/types';
import { ProcessType } from '@madfam/shared';
import { Decimal } from 'decimal.js';

// Create a concrete implementation for testing
class TestPricingCalculator extends BasePricingCalculator {
  calculate(): PricingResult {
    const time = this.calculateProcessingTime();
    const usage = this.calculateMaterialUsage();
    
    const materialCost = this.calculateMaterialCost(usage);
    const machineCost = this.calculateMachineCost(time);
    const energyCost = this.calculateEnergyCost(time);
    const laborCost = this.calculateLaborCost(time);
    
    const subtotal = materialCost
      .plus(machineCost)
      .plus(energyCost)
      .plus(laborCost);
    
    const overheadCost = this.calculateOverheadCost(subtotal);
    const costTotal = subtotal.plus(overheadCost);
    const marginAmount = this.calculateMargin(costTotal);
    
    const basePrice = costTotal.plus(marginAmount);
    const discount = this.calculateVolumeDiscount(basePrice);
    const unitPrice = basePrice.minus(discount);
    const totalPrice = unitPrice.mul(this.input.quantity);
    
    const energyKwh = new Decimal(time.processingMinutes)
      .div(60)
      .mul(this.input.machine.powerW)
      .div(1000);
    
    const sustainability = this.calculateSustainability(energyKwh, usage);
    const leadDays = this.calculateLeadTime();
    
    return {
      unitPrice,
      totalPrice,
      leadDays,
      costBreakdown: this.buildCostBreakdown(
        materialCost,
        machineCost,
        energyCost,
        laborCost,
        overheadCost,
        marginAmount,
        discount
      ),
      sustainability,
      confidence: 0.9,
      warnings: [],
    };
  }
  
  calculateProcessingTime() {
    return {
      setupMinutes: 15,
      processingMinutes: 60,
      postProcessingMinutes: 10,
      totalMinutes: 85,
    };
  }
  
  calculateMaterialUsage() {
    return {
      netVolumeCm3: 10,
      grossVolumeCm3: 11,
      wasteFactor: 0.1,
    };
  }
}

describe('BasePricingCalculator', () => {
  let calculator: TestPricingCalculator;
  let input: PricingInput;

  beforeEach(() => {
    input = {
      process: ProcessType.FFF,
      geometry: {
        volumeCm3: 10,
        surfaceAreaCm2: 50,
        bboxMm: { x: 40, y: 40, z: 40 },
      },
      material: {
        id: 'test-material',
        name: 'Test Material',
        costPerKg: new Decimal(25),
        densityGCm3: 1.24,
        category: 'test',
      },
      machine: {
        id: 'test-machine',
        name: 'Test Machine',
        costPerHour: new Decimal(10),
        setupMinutes: 15,
        powerW: 150,
      },
      quantity: 1,
      tenantConfig: {
        markupPercent: 50,
        overheadPercent: 20,
        laborCostPerHour: new Decimal(25),
        currency: 'USD',
        minOrderValue: new Decimal(10),
      },
      selections: {},
    };
    calculator = new TestPricingCalculator(input);
  });

  describe('calculateMaterialCost', () => {
    it('should calculate material cost correctly', () => {
      const usage = { netVolumeCm3: 10, grossVolumeCm3: 11, wasteFactor: 0.1 };
      const cost = calculator.calculateMaterialCost(usage);
      
      // 11 cm³ * 1.24 g/cm³ = 13.64g = 0.01364 kg * $25/kg = $0.341
      expect(cost.toNumber()).toBeCloseTo(0.341, 2);
    });

    it('should handle zero volume', () => {
      const usage = { netVolumeCm3: 0, grossVolumeCm3: 0, wasteFactor: 0 };
      const cost = calculator.calculateMaterialCost(usage);
      expect(cost.toNumber()).toBe(0);
    });
  });

  describe('calculateMachineCost', () => {
    it('should calculate machine cost correctly', () => {
      const time = { setupMinutes: 15, processingMinutes: 60, postProcessingMinutes: 10, totalMinutes: 85 };
      const cost = calculator.calculateMachineCost(time);
      
      // 85 minutes / 60 * $10/hour = $14.17
      expect(cost.toNumber()).toBeCloseTo(14.17, 2);
    });
  });

  describe('calculateEnergyCost', () => {
    it('should calculate energy cost correctly', () => {
      const time = { setupMinutes: 15, processingMinutes: 60, postProcessingMinutes: 10, totalMinutes: 85 };
      const cost = calculator.calculateEnergyCost(time);
      
      // 85 minutes / 60 * 150W / 1000 * $0.12/kWh = $0.0255
      expect(cost.toNumber()).toBeCloseTo(0.0255, 3);
    });

    it('should use tenant-specific energy rate if provided', () => {
      input.tenantConfig.energyCostPerKwh = new Decimal(0.20);
      const calc = new TestPricingCalculator(input);
      const time = { setupMinutes: 0, processingMinutes: 60, postProcessingMinutes: 0, totalMinutes: 60 };
      const cost = calc.calculateEnergyCost(time);
      
      // 60 minutes / 60 * 150W / 1000 * $0.20/kWh = $0.03
      expect(cost.toNumber()).toBeCloseTo(0.03, 3);
    });
  });

  describe('calculateLaborCost', () => {
    it('should calculate labor cost correctly', () => {
      const time = { setupMinutes: 15, processingMinutes: 60, postProcessingMinutes: 10, totalMinutes: 85 };
      const cost = calculator.calculateLaborCost(time);
      
      // Setup: 15 min / 60 * $25 = $6.25
      // Post-processing: 10 min / 60 * $25 = $4.17
      // Total: $10.42
      expect(cost.toNumber()).toBeCloseTo(10.42, 2);
    });

    it('should not include processing time in labor cost', () => {
      const time = { setupMinutes: 0, processingMinutes: 120, postProcessingMinutes: 0, totalMinutes: 120 };
      const cost = calculator.calculateLaborCost(time);
      expect(cost.toNumber()).toBe(0);
    });
  });

  describe('calculateOverheadCost', () => {
    it('should calculate overhead as percentage of subtotal', () => {
      const subtotal = new Decimal(100);
      const overhead = calculator.calculateOverheadCost(subtotal);
      
      // 20% of $100 = $20
      expect(overhead.toNumber()).toBe(20);
    });
  });

  describe('calculateMargin', () => {
    it('should calculate margin based on markup percent', () => {
      const cost = new Decimal(100);
      const margin = calculator.calculateMargin(cost);
      
      // 50% markup on $100 = $50
      expect(margin.toNumber()).toBe(50);
    });

    it('should handle zero cost', () => {
      const cost = new Decimal(0);
      const margin = calculator.calculateMargin(cost);
      expect(margin.toNumber()).toBe(0);
    });
  });

  describe('calculateVolumeDiscount', () => {
    it('should not apply discount for single item', () => {
      const basePrice = new Decimal(100);
      const discount = calculator.calculateVolumeDiscount(basePrice);
      expect(discount.toNumber()).toBe(0);
    });

    it('should apply 5% discount for 10+ items', () => {
      input.quantity = 10;
      const calc = new TestPricingCalculator(input);
      const basePrice = new Decimal(100);
      const discount = calc.calculateVolumeDiscount(basePrice);
      expect(discount.toNumber()).toBe(5);
    });

    it('should apply 10% discount for 50+ items', () => {
      input.quantity = 50;
      const calc = new TestPricingCalculator(input);
      const basePrice = new Decimal(100);
      const discount = calc.calculateVolumeDiscount(basePrice);
      expect(discount.toNumber()).toBe(10);
    });

    it('should apply 15% discount for 100+ items', () => {
      input.quantity = 100;
      const calc = new TestPricingCalculator(input);
      const basePrice = new Decimal(100);
      const discount = calc.calculateVolumeDiscount(basePrice);
      expect(discount.toNumber()).toBe(15);
    });

    it('should apply 20% discount for 500+ items', () => {
      input.quantity = 500;
      const calc = new TestPricingCalculator(input);
      const basePrice = new Decimal(100);
      const discount = calc.calculateVolumeDiscount(basePrice);
      expect(discount.toNumber()).toBe(20);
    });

    it('should cap discount at 20% for 1000+ items', () => {
      input.quantity = 1000;
      const calc = new TestPricingCalculator(input);
      const basePrice = new Decimal(100);
      const discount = calc.calculateVolumeDiscount(basePrice);
      expect(discount.toNumber()).toBe(20);
    });
  });

  describe('calculateSustainability', () => {
    it('should calculate sustainability metrics', () => {
      const energyKwh = new Decimal(1);
      const usage = { netVolumeCm3: 10, grossVolumeCm3: 11, wasteFactor: 0.1 };
      const sustainability = calculator.calculateSustainability(energyKwh, usage);
      
      expect(sustainability.co2Kg).toBeGreaterThan(0);
      expect(sustainability.energyKwh).toBe(1);
      expect(sustainability.materialWasteKg).toBeGreaterThan(0);
      expect(sustainability.score).toBeGreaterThanOrEqual(0);
      expect(sustainability.score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateLeadTime', () => {
    it('should calculate lead time in days', () => {
      const leadDays = calculator.calculateLeadTime();
      expect(leadDays).toBeGreaterThan(0);
      expect(Number.isInteger(leadDays)).toBe(true);
    });

    it('should increase lead time for larger quantities', () => {
      const singleLead = calculator.calculateLeadTime();
      
      input.quantity = 100;
      const bulkCalc = new TestPricingCalculator(input);
      const bulkLead = bulkCalc.calculateLeadTime();
      
      expect(bulkLead).toBeGreaterThanOrEqual(singleLead);
    });
  });

  describe('buildCostBreakdown', () => {
    it('should build complete cost breakdown', () => {
      const breakdown = calculator.buildCostBreakdown(
        new Decimal(10),  // material
        new Decimal(20),  // machine
        new Decimal(5),   // energy
        new Decimal(15),  // labor
        new Decimal(10),  // overhead
        new Decimal(30),  // margin
        new Decimal(5)    // discount
      );
      
      expect(breakdown.material.toNumber()).toBe(10);
      expect(breakdown.machine.toNumber()).toBe(20);
      expect(breakdown.energy.toNumber()).toBe(5);
      expect(breakdown.labor.toNumber()).toBe(15);
      expect(breakdown.overhead.toNumber()).toBe(10);
      expect(breakdown.margin.toNumber()).toBe(30);
      expect(breakdown.discount.toNumber()).toBe(5);
      expect(breakdown.subtotal.toNumber()).toBe(50); // material + machine + energy + labor
      expect(breakdown.total.toNumber()).toBe(85);    // subtotal + overhead + margin - discount
    });
  });

  describe('enforceMinimumOrder', () => {
    it('should enforce minimum order value', () => {
      input.tenantConfig.minOrderValue = new Decimal(100);
      input.geometry.volumeCm3 = 0.1; // Very small part
      
      const calc = new TestPricingCalculator(input);
      const result = calc.calculate();
      
      expect(result.totalPrice.toNumber()).toBeGreaterThanOrEqual(100);
    });

    it('should not adjust price if already above minimum', () => {
      input.tenantConfig.minOrderValue = new Decimal(10);
      input.quantity = 10;
      
      const calc = new TestPricingCalculator(input);
      const result = calc.calculate();
      
      // Should be well above $10 minimum
      expect(result.totalPrice.toNumber()).toBeGreaterThan(10);
    });
  });
});