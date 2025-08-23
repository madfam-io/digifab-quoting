import { Decimal } from 'decimal.js';
import { FFFPricingCalculator } from '../fff.calculator';
import { PricingInput, TenantPricingConfig } from '../../types';
import { ProcessType } from '@madfam/shared';

describe('FFFPricingCalculator', () => {
  let defaultConfig: TenantPricingConfig;
  let basePricingInput: PricingInput;

  beforeEach(() => {
    defaultConfig = {
      marginFloorPercent: new Decimal(30),
      overheadPercent: new Decimal(15),
      energyTariffPerKwh: new Decimal(0.12),
      laborRatePerHour: new Decimal(25),
      rushUpchargePercent: new Decimal(50),
      volumeDiscounts: [
        { minQuantity: 10, discountPercent: new Decimal(5) },
        { minQuantity: 50, discountPercent: new Decimal(10) },
        { minQuantity: 100, discountPercent: new Decimal(15) },
      ],
      gridCo2eFactor: new Decimal(0.42),
      logisticsCo2eFactor: new Decimal(0.0002),
    };

    basePricingInput = {
      process: ProcessType.FFF,
      geometry: {
        volumeCm3: 10,
        surfaceAreaCm2: 50,
        bboxMm: { x: 50, y: 50, z: 40 },
      },
      material: {
        id: '1',
        tenantId: '1',
        process: ProcessType.FFF,
        name: 'PLA',
        code: 'PLA-001',
        density: 1.24,
        co2eFactor: 1.6,
        costUom: 'kg',
        pricePerUom: 25,
        recycledPercent: 0,
        active: true,
        versionEffectiveFrom: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      machine: {
        id: '1',
        tenantId: '1',
        process: ProcessType.FFF,
        model: 'Prusa MK3S',
        name: 'Printer 1',
        powerW: 120,
        hourlyRate: 15,
        setupMinutes: 10,
        active: true,
        specs: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      selections: {
        material: 'PLA',
        layerHeight: 0.2,
        infill: 35,
      },
      quantity: 1,
      tenantConfig: defaultConfig,
    };
  });

  describe('calculate', () => {
    it('should calculate pricing for a standard part', () => {
      const calculator = new FFFPricingCalculator(basePricingInput);
      const result = calculator.calculate();

      expect(result).toBeDefined();
      expect(result.unitPrice).toBeInstanceOf(Decimal);
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(result.leadDays).toBe(3);
      expect(result.costBreakdown).toBeDefined();
      expect(result.costBreakdown.material).toBeInstanceOf(Decimal);
      expect(result.costBreakdown.machine).toBeInstanceOf(Decimal);
      expect(result.costBreakdown.energy).toBeInstanceOf(Decimal);
      expect(result.costBreakdown.labor).toBeInstanceOf(Decimal);
      expect(result.costBreakdown.overhead).toBeInstanceOf(Decimal);
      expect(result.costBreakdown.margin).toBeInstanceOf(Decimal);
      expect(result.sustainability.score).toBeGreaterThan(0);
    });

    it('should handle different layer heights appropriately', () => {
      const fineLayersInput = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, layerHeight: 0.1 },
      };
      const coarseLayersInput = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, layerHeight: 0.3 },
      };

      const fineCalculator = new FFFPricingCalculator(fineLayersInput);
      const coarseCalculator = new FFFPricingCalculator(coarseLayersInput);

      const fineLayers = fineCalculator.calculate();
      const coarseLayers = coarseCalculator.calculate();

      expect(fineLayers.unitPrice.toNumber()).toBeGreaterThan(coarseLayers.unitPrice.toNumber());
      expect(fineLayers.costBreakdown.machine.toNumber()).toBeGreaterThan(
        coarseLayers.costBreakdown.machine.toNumber(),
      );
    });

    it('should calculate support material cost correctly', () => {
      const withSupportsInput = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, supportsRequired: true },
      };
      const withoutSupportsInput = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, supportsRequired: false },
      };

      const withSupportsCalc = new FFFPricingCalculator(withSupportsInput);
      const withoutSupportsCalc = new FFFPricingCalculator(withoutSupportsInput);

      const withSupports = withSupportsCalc.calculate();
      const withoutSupports = withoutSupportsCalc.calculate();

      expect(withSupports.unitPrice.toNumber()).toBeGreaterThan(
        withoutSupports.unitPrice.toNumber(),
      );
      expect(withSupports.costBreakdown.material.toNumber()).toBeGreaterThan(
        withoutSupports.costBreakdown.material.toNumber(),
      );
    });

    it('should handle different infill percentages', () => {
      const lowInfillInput = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, infill: 15 },
      };
      const highInfillInput = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, infill: 80 },
      };

      const lowInfillCalc = new FFFPricingCalculator(lowInfillInput);
      const highInfillCalc = new FFFPricingCalculator(highInfillInput);

      const lowInfill = lowInfillCalc.calculate();
      const highInfill = highInfillCalc.calculate();

      expect(highInfill.unitPrice.toNumber()).toBeGreaterThan(lowInfill.unitPrice.toNumber());
      expect(highInfill.costBreakdown.material.toNumber()).toBeGreaterThan(
        lowInfill.costBreakdown.material.toNumber(),
      );
    });

    it('should apply minimum charge for very small parts', () => {
      const tinyPartInput = {
        ...basePricingInput,
        geometry: {
          volumeCm3: 0.1,
          surfaceAreaCm2: 1,
          bboxMm: { x: 5, y: 5, z: 4 },
        },
      };

      const calculator = new FFFPricingCalculator(tinyPartInput);
      const tinyPart = calculator.calculate();

      expect(tinyPart.unitPrice.toNumber()).toBeGreaterThanOrEqual(5);
      expect(tinyPart.warnings).toContain('Minimum charge applied');
    });

    it('should generate warnings for parts exceeding machine limits', () => {
      const largePartInput = {
        ...basePricingInput,
        geometry: {
          volumeCm3: 1000,
          surfaceAreaCm2: 5000,
          bboxMm: { x: 300, y: 300, z: 400 },
        },
      };

      const calculator = new FFFPricingCalculator(largePartInput);
      const largePart = calculator.calculate();

      expect(largePart.warnings).toContain('Part exceeds recommended build volume');
    });

    it('should handle rush orders with upcharge', () => {
      const rushOrderInput = {
        ...basePricingInput,
        requiredByDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      };

      const rushCalculator = new FFFPricingCalculator(rushOrderInput);
      const standardCalculator = new FFFPricingCalculator(basePricingInput);

      const rushOrder = rushCalculator.calculate();
      const standardOrder = standardCalculator.calculate();

      expect(rushOrder.unitPrice.toNumber()).toBeGreaterThan(standardOrder.unitPrice.toNumber());
      expect(rushOrder.warnings).toContain('Rush order upcharge applied');
      expect(rushOrder.leadDays).toBeLessThan(standardOrder.leadDays);
    });
  });

  describe('calculateProcessingTime', () => {
    it('should calculate processing time based on layer height and volume', () => {
      const input = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, layerHeight: 0.2 },
      };
      const calculator = new FFFPricingCalculator(input);
      const time = calculator.calculateProcessingTime();

      expect(time.processingMinutes).toBeGreaterThan(0);
      expect(time.totalMinutes).toBeLessThan(24 * 60); // Should be less than 24 hours for small part
    });

    it('should increase time for finer layer heights', () => {
      const fineLayersInput = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, layerHeight: 0.1 },
      };
      const coarseLayersInput = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, layerHeight: 0.3 },
      };

      const fineCalc = new FFFPricingCalculator(fineLayersInput);
      const coarseCalc = new FFFPricingCalculator(coarseLayersInput);

      const fineLayers = fineCalc.calculateProcessingTime();
      const coarseLayers = coarseCalc.calculateProcessingTime();

      expect(fineLayers.processingMinutes).toBeGreaterThan(coarseLayers.processingMinutes * 2.5);
    });
  });

  describe('calculateMaterialUsage', () => {
    it('should calculate material usage with infill', () => {
      const input = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, infill: 35 },
      };
      const calculator = new FFFPricingCalculator(input);
      const usage = calculator.calculateMaterialUsage();

      const expectedUsage = 10 * (0.35 + (1 - 0.35) * 0.15); // volume * (infill + shell)
      expect(usage.grossVolumeCm3).toBeCloseTo(expectedUsage, 1);
    });

    it('should add support material when required', () => {
      const withSupportsInput = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, supportsRequired: true },
      };
      const withoutSupportsInput = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, supportsRequired: false },
      };

      const withSupportsCalc = new FFFPricingCalculator(withSupportsInput);
      const withoutSupportsCalc = new FFFPricingCalculator(withoutSupportsInput);

      const withSupports = withSupportsCalc.calculateMaterialUsage();
      const withoutSupports = withoutSupportsCalc.calculateMaterialUsage();

      expect(withSupports.grossVolumeCm3).toBeGreaterThan(withoutSupports.grossVolumeCm3);
    });

    it('should handle 100% infill', () => {
      const input = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, infill: 100 },
      };
      const calculator = new FFFPricingCalculator(input);
      const usage = calculator.calculateMaterialUsage();

      expect(usage.grossVolumeCm3).toBeCloseTo(10, 0.5); // Should be close to actual volume
    });
  });

  describe('cost breakdown accuracy', () => {
    it('should sum all cost components to total cost', () => {
      const calculator = new FFFPricingCalculator(basePricingInput);
      const result = calculator.calculate();
      const breakdown = result.costBreakdown;

      const sumOfCosts = breakdown.material
        .plus(breakdown.machine)
        .plus(breakdown.energy)
        .plus(breakdown.labor)
        .plus(breakdown.overhead)
        .plus(breakdown.margin)
        .minus(breakdown.discount || 0);

      expect(sumOfCosts.toNumber()).toBeCloseTo(result.unitPrice.toNumber(), 2);
    });

    it('should enforce minimum margin', () => {
      // Create input that would result in very low margin
      const lowMarginInput = {
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          pricePerUom: 100, // Very expensive material
        },
      };

      const calculator = new FFFPricingCalculator(lowMarginInput);
      const result = calculator.calculate();
      const marginPercent = result.costBreakdown.margin.div(result.unitPrice).mul(100);

      expect(marginPercent.toNumber()).toBeGreaterThanOrEqual(30);
    });
  });

  describe('sustainability calculations', () => {
    it('should calculate CO2e for all components', () => {
      const calculator = new FFFPricingCalculator(basePricingInput);
      const result = calculator.calculate();
      const sustainability = result.sustainability;

      expect(sustainability.co2e.material).toBeGreaterThan(0);
      expect(sustainability.co2e.energy).toBeGreaterThan(0);
      expect(sustainability.co2e.logistics).toBeGreaterThan(0);
      expect(sustainability.co2e.total).toBeGreaterThan(0);

      const expectedTotal =
        sustainability.co2e.material + sustainability.co2e.energy + sustainability.co2e.logistics;
      expect(sustainability.co2e.total).toBeCloseTo(expectedTotal, 2);
    });

    it('should calculate waste percentage', () => {
      const input = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, supportsRequired: true },
      };
      const calculator = new FFFPricingCalculator(input);
      const result = calculator.calculate();

      expect(result.sustainability.wastePercent).toBeGreaterThan(0);
      expect(result.sustainability.wastePercent).toBeLessThan(100);
    });

    it('should provide higher score for recycled materials', () => {
      const recycledInput = {
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          recycledPercent: 80,
        },
      };

      const recycledCalc = new FFFPricingCalculator(recycledInput);
      const virginCalc = new FFFPricingCalculator(basePricingInput);

      const recycledResult = recycledCalc.calculate();
      const virginResult = virginCalc.calculate();

      expect(recycledResult.sustainability.score).toBeGreaterThan(
        virginResult.sustainability.score,
      );
    });
  });

  describe('edge cases', () => {
    it('should handle zero infill', () => {
      const input = {
        ...basePricingInput,
        selections: { ...basePricingInput.selections, infill: 0 },
      };
      const calculator = new FFFPricingCalculator(input);
      const result = calculator.calculate();

      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(result.costBreakdown.material.toNumber()).toBeGreaterThan(0); // Should still have shell material
    });

    it('should handle very tall thin parts', () => {
      const input = {
        ...basePricingInput,
        geometry: {
          volumeCm3: 2,
          surfaceAreaCm2: 100,
          bboxMm: { x: 10, y: 10, z: 200 },
        },
      };
      const calculator = new FFFPricingCalculator(input);
      const result = calculator.calculate();

      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(result.warnings).toContain('Tall part may require special handling');
    });

    it('should handle multiple material types', () => {
      const absMaterial = {
        ...basePricingInput.material,
        name: 'ABS',
        code: 'ABS-001',
        density: 1.05,
        pricePerUom: 30,
      };

      const absInput = {
        ...basePricingInput,
        material: absMaterial,
        selections: { ...basePricingInput.selections, material: 'ABS' },
      };

      const absCalc = new FFFPricingCalculator(absInput);
      const plaCalc = new FFFPricingCalculator(basePricingInput);

      const absResult = absCalc.calculate();
      const plaResult = plaCalc.calculate();

      expect(absResult.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(absResult.costBreakdown.material.toNumber()).not.toBe(
        plaResult.costBreakdown.material.toNumber(),
      );
    });
  });
});
