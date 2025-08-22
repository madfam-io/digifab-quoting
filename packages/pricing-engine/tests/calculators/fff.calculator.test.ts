import { describe, it, expect, beforeEach } from '@jest/globals';
import { FFFPricingCalculator } from '../../src/calculators/fff.calculator';
import { PricingInput } from '../../src/types';
import { ProcessType } from '@madfam/shared';
import { Decimal } from 'decimal.js';

describe('FFFPricingCalculator', () => {
  let calculator: FFFPricingCalculator;
  let input: PricingInput;

  beforeEach(() => {
    input = {
      process: ProcessType.FFF,
      geometry: {
        volumeCm3: 10,
        surfaceAreaCm2: 50,
        bboxMm: { x: 40, y: 40, z: 40 },
        overhangArea: 5,
      },
      material: {
        id: 'pla-basic',
        name: 'PLA Basic',
        costPerKg: new Decimal(25),
        densityGCm3: 1.24,
        category: 'thermoplastic',
      },
      machine: {
        id: 'prusa-mk3',
        name: 'Prusa MK3',
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
      selections: {
        infill: 35,
        layerHeight: 0.2,
      },
    };
    calculator = new FFFPricingCalculator(input);
  });

  describe('calculateProcessingTime', () => {
    it('should calculate standard print time', () => {
      const time = calculator.calculateProcessingTime();
      
      expect(time.setupMinutes).toBe(15);
      expect(time.processingMinutes).toBeGreaterThan(0);
      expect(time.postProcessingMinutes).toBeGreaterThan(0);
      expect(time.totalMinutes).toBe(
        time.setupMinutes + time.processingMinutes + time.postProcessingMinutes
      );
    });

    it('should increase time for fine layer heights', () => {
      const standardCalc = new FFFPricingCalculator(input);
      const standardTime = standardCalc.calculateProcessingTime();

      input.selections.layerHeight = 0.05; // Very fine
      const fineCalc = new FFFPricingCalculator(input);
      const fineTime = fineCalc.calculateProcessingTime();

      expect(fineTime.processingMinutes).toBeGreaterThan(standardTime.processingMinutes);
    });

    it('should add post-processing time for supports', () => {
      input.geometry.overhangArea = 0;
      const noSupportCalc = new FFFPricingCalculator(input);
      const noSupportTime = noSupportCalc.calculateProcessingTime();

      input.geometry.overhangArea = 10;
      const withSupportCalc = new FFFPricingCalculator(input);
      const withSupportTime = withSupportCalc.calculateProcessingTime();

      expect(withSupportTime.postProcessingMinutes).toBeGreaterThan(
        noSupportTime.postProcessingMinutes
      );
    });
  });

  describe('calculateMaterialUsage', () => {
    it('should calculate material usage with infill', () => {
      const usage = calculator.calculateMaterialUsage();
      
      const expectedNetVolume = 10 * 0.35; // 35% infill
      expect(usage.netVolumeCm3).toBeCloseTo(expectedNetVolume, 2);
      expect(usage.grossVolumeCm3).toBeGreaterThan(usage.netVolumeCm3);
      expect(usage.wasteFactor).toBe(0.05);
    });

    it('should add support material when needed', () => {
      input.geometry.overhangArea = 20;
      const calc = new FFFPricingCalculator(input);
      const usage = calc.calculateMaterialUsage();
      
      expect(usage.supportVolumeCm3).toBeGreaterThan(0);
    });

    it('should handle different infill percentages', () => {
      input.selections.infill = 100;
      const solidCalc = new FFFPricingCalculator(input);
      const solidUsage = solidCalc.calculateMaterialUsage();

      input.selections.infill = 20;
      const sparseCalc = new FFFPricingCalculator(input);
      const sparseUsage = sparseCalc.calculateMaterialUsage();

      expect(solidUsage.netVolumeCm3).toBeGreaterThan(sparseUsage.netVolumeCm3);
    });
  });

  describe('calculate (full pricing)', () => {
    it('should produce complete pricing result', () => {
      const result = calculator.calculate();

      expect(result.unitPrice).toBeInstanceOf(Decimal);
      expect(result.totalPrice).toBeInstanceOf(Decimal);
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(result.leadDays).toBeGreaterThan(0);
      expect(result.confidence).toBe(0.95);
    });

    it('should include all cost components', () => {
      const result = calculator.calculate();
      const breakdown = result.costBreakdown;

      expect(breakdown.material.toNumber()).toBeGreaterThan(0);
      expect(breakdown.machine.toNumber()).toBeGreaterThan(0);
      expect(breakdown.energy.toNumber()).toBeGreaterThan(0);
      expect(breakdown.labor.toNumber()).toBeGreaterThan(0);
      expect(breakdown.overhead.toNumber()).toBeGreaterThan(0);
      expect(breakdown.margin.toNumber()).toBeGreaterThan(0);
    });

    it('should calculate sustainability metrics', () => {
      const result = calculator.calculate();
      
      expect(result.sustainability).toBeDefined();
      expect(result.sustainability.co2Kg).toBeGreaterThan(0);
      expect(result.sustainability.energyKwh).toBeGreaterThan(0);
      expect(result.sustainability.materialWasteKg).toBeGreaterThan(0);
      expect(result.sustainability.score).toBeGreaterThanOrEqual(0);
      expect(result.sustainability.score).toBeLessThanOrEqual(100);
    });

    it('should apply volume discounts', () => {
      input.quantity = 1;
      const singleResult = calculator.calculate();

      input.quantity = 100;
      const bulkCalc = new FFFPricingCalculator(input);
      const bulkResult = bulkCalc.calculate();

      expect(bulkResult.unitPrice.toNumber()).toBeLessThan(
        singleResult.unitPrice.toNumber()
      );
    });

    it('should generate warnings for edge cases', () => {
      // Large part
      input.geometry.bboxMm = { x: 300, y: 300, z: 300 };
      const largeCalc = new FFFPricingCalculator(input);
      const largeResult = largeCalc.calculate();
      expect(largeResult.warnings).toContain('Part dimensions exceed typical build volume');

      // Very fine layer height
      input.geometry.bboxMm = { x: 40, y: 40, z: 40 };
      input.selections.layerHeight = 0.05;
      const fineCalc = new FFFPricingCalculator(input);
      const fineResult = fineCalc.calculate();
      expect(fineResult.warnings).toContain(
        'Very fine layer height will significantly increase print time'
      );
    });

    it('should enforce minimum order value', () => {
      input.geometry.volumeCm3 = 0.1; // Very small part
      input.tenantConfig.minOrderValue = new Decimal(50);
      
      const calc = new FFFPricingCalculator(input);
      const result = calc.calculate();
      
      expect(result.totalPrice.toNumber()).toBeGreaterThanOrEqual(50);
    });
  });

  describe('edge cases', () => {
    it('should handle zero infill', () => {
      input.selections.infill = 0;
      const calc = new FFFPricingCalculator(input);
      expect(() => calc.calculate()).not.toThrow();
    });

    it('should handle missing optional selections', () => {
      delete input.selections.infill;
      delete input.selections.layerHeight;
      
      const calc = new FFFPricingCalculator(input);
      const result = calc.calculate();
      
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
    });

    it('should handle very large volumes', () => {
      input.geometry.volumeCm3 = 10000;
      input.geometry.bboxMm = { x: 500, y: 500, z: 500 };
      
      const calc = new FFFPricingCalculator(input);
      const result = calc.calculate();
      
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});