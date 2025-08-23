import { Decimal } from 'decimal.js';
import { SLAPricingCalculator } from '../sla.calculator';
import { PricingInput, TenantPricingConfig } from '../../types';
import { ProcessType } from '@madfam/shared';

describe('SLAPricingCalculator', () => {
  let calculator: SLAPricingCalculator;
  let defaultConfig: TenantPricingConfig;
  let basePricingInput: PricingInput;

  beforeEach(() => {
    calculator = new SLAPricingCalculator();
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
      process: ProcessType.SLA,
      geometry: {
        volumeCm3: 5,
        surfaceAreaCm2: 30,
        bboxMm: { x: 30, y: 30, z: 50 },
      },
      material: {
        id: '2',
        tenantId: '1',
        process: ProcessType.SLA,
        name: 'Standard Resin',
        code: 'RESIN-001',
        density: 1.15,
        co2eFactor: 6.0,
        costUom: 'l',
        pricePerUom: 80,
        recycledPercent: 0,
        active: true,
        versionEffectiveFrom: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      machine: {
        id: '2',
        tenantId: '1',
        process: ProcessType.SLA,
        model: 'Form 3',
        name: 'SLA Printer 1',
        powerW: 65,
        hourlyRate: 25,
        setupMinutes: 15,
        active: true,
        specs: {
          buildVolume: { x: 145, y: 145, z: 185 },
          layerHeightMin: 0.025,
          layerHeightMax: 0.3,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      selections: {
        material: 'Standard Resin',
        layerHeight: 0.05,
      },
      quantity: 1,
      tenantConfig: defaultConfig,
    };
  });

  describe('calculate', () => {
    it('should calculate pricing for a standard SLA part', () => {
      const result = calculator.calculate(basePricingInput);

      expect(result).toBeDefined();
      expect(result.unitPrice).toBeInstanceOf(Decimal);
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(result.leadDays).toBe(4); // SLA typically needs more post-processing
      expect(result.costBreakdown).toBeDefined();
      expect(result.costBreakdown.material).toBeInstanceOf(Decimal);
      expect(result.costBreakdown.machine).toBeInstanceOf(Decimal);
      expect(result.costBreakdown.energy).toBeInstanceOf(Decimal);
      expect(result.costBreakdown.labor).toBeInstanceOf(Decimal);
      expect(result.sustainability.score).toBeGreaterThan(0);
    });

    it('should handle different layer heights for SLA', () => {
      const fineLayers = calculator.calculate({
        ...basePricingInput,
        selections: { ...basePricingInput.selections, layerHeight: 0.025 },
      });

      const standardLayers = calculator.calculate({
        ...basePricingInput,
        selections: { ...basePricingInput.selections, layerHeight: 0.1 },
      });

      expect(fineLayers.unitPrice.toNumber()).toBeGreaterThan(standardLayers.unitPrice.toNumber());
      expect(fineLayers.costBreakdown.machine.toNumber()).toBeGreaterThan(
        standardLayers.costBreakdown.machine.toNumber(),
      );
    });

    it('should calculate support material for SLA parts', () => {
      const withSupports = calculator.calculate({
        ...basePricingInput,
        selections: { ...basePricingInput.selections, supportsRequired: true },
      });

      const withoutSupports = calculator.calculate({
        ...basePricingInput,
        selections: { ...basePricingInput.selections, supportsRequired: false },
      });

      expect(withSupports.unitPrice.toNumber()).toBeGreaterThan(
        withoutSupports.unitPrice.toNumber(),
      );
      expect(withSupports.costBreakdown.material.toNumber()).toBeGreaterThan(
        withoutSupports.costBreakdown.material.toNumber(),
      );
    });

    it('should account for post-processing time', () => {
      const result = calculator.calculate(basePricingInput);

      // SLA requires washing and curing
      expect(result.costBreakdown.labor.toNumber()).toBeGreaterThan(5); // Minimum labor cost
      expect(result.costBreakdown.labor.toNumber()).toBeGreaterThan(
        basePricingInput.tenantConfig.laborRatePerHour.mul(0.5).toNumber(), // At least 30 min post-processing
      );
    });

    it('should handle different resin types', () => {
      const toughResin = calculator.calculate({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          name: 'Tough Resin',
          code: 'RESIN-TOUGH',
          pricePerUom: 150, // More expensive
        },
        selections: { ...basePricingInput.selections, material: 'Tough Resin' },
      });

      const standardResin = calculator.calculate(basePricingInput);

      expect(toughResin.unitPrice.toNumber()).toBeGreaterThan(standardResin.unitPrice.toNumber());
      expect(toughResin.costBreakdown.material.toNumber()).toBeGreaterThan(
        standardResin.costBreakdown.material.toNumber(),
      );
    });

    it('should apply minimum charge for tiny SLA parts', () => {
      const tinyPart = calculator.calculate({
        ...basePricingInput,
        geometry: {
          volumeCm3: 0.05,
          surfaceAreaCm2: 0.5,
          bboxMm: { x: 5, y: 5, z: 2 },
        },
      });

      expect(tinyPart.unitPrice.toNumber()).toBeGreaterThanOrEqual(10); // Higher minimum for SLA
      expect(tinyPart.warnings).toContain('Minimum charge applied');
    });

    it('should warn about parts exceeding build volume', () => {
      const largePart = calculator.calculate({
        ...basePricingInput,
        geometry: {
          volumeCm3: 500,
          surfaceAreaCm2: 2000,
          bboxMm: { x: 150, y: 150, z: 200 },
        },
      });

      expect(largePart.warnings).toContain('Part exceeds build volume');
    });

    it('should handle tall thin parts with warnings', () => {
      const tallPart = calculator.calculate({
        ...basePricingInput,
        geometry: {
          volumeCm3: 2,
          surfaceAreaCm2: 50,
          bboxMm: { x: 10, y: 10, z: 180 },
        },
      });

      expect(tallPart.warnings).toContain('Tall part may require special supports');
      expect(tallPart.unitPrice.toNumber()).toBeGreaterThan(0);
    });
  });

  describe('calculateProcessingTime', () => {
    it('should calculate processing time based on layers and exposure', () => {
      const time = calculator.calculateProcessingTime(basePricingInput);

      expect(time.toNumber()).toBeGreaterThan(0);
      expect(time.toNumber()).toBeLessThan(12); // Should be reasonable for small part
    });

    it('should increase time for more layers', () => {
      const fineLayers = calculator.calculateProcessingTime({
        ...basePricingInput,
        selections: { ...basePricingInput.selections, layerHeight: 0.025 },
      });

      const coarseLayers = calculator.calculateProcessingTime({
        ...basePricingInput,
        selections: { ...basePricingInput.selections, layerHeight: 0.1 },
      });

      expect(fineLayers.toNumber()).toBeGreaterThan(coarseLayers.toNumber() * 3);
    });

    it('should account for part height in time calculation', () => {
      const tallPart = calculator.calculateProcessingTime({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          bboxMm: { x: 30, y: 30, z: 150 },
        },
      });

      const shortPart = calculator.calculateProcessingTime({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          bboxMm: { x: 30, y: 30, z: 30 },
        },
      });

      expect(tallPart.toNumber()).toBeGreaterThan(shortPart.toNumber() * 4);
    });
  });

  describe('calculateMaterialUsage', () => {
    it('should calculate resin usage with supports', () => {
      const usage = calculator.calculateMaterialUsage({
        ...basePricingInput,
        selections: { ...basePricingInput.selections, supportsRequired: true },
      });

      // Base volume + support volume + resin tank loss
      expect(usage.toNumber()).toBeGreaterThan(basePricingInput.geometry.volumeCm3);
      expect(usage.toNumber()).toBeLessThan(basePricingInput.geometry.volumeCm3 * 2);
    });

    it('should account for resin tank minimum', () => {
      const tinyPart = calculator.calculateMaterialUsage({
        ...basePricingInput,
        geometry: {
          volumeCm3: 0.1,
          surfaceAreaCm2: 1,
          bboxMm: { x: 5, y: 5, z: 5 },
        },
      });

      // Even tiny parts require minimum resin in tank
      expect(tinyPart.toNumber()).toBeGreaterThan(0.5);
    });

    it('should handle parts without supports', () => {
      const usage = calculator.calculateMaterialUsage({
        ...basePricingInput,
        selections: { ...basePricingInput.selections, supportsRequired: false },
      });

      expect(usage.toNumber()).toBeGreaterThan(basePricingInput.geometry.volumeCm3);
      expect(usage.toNumber()).toBeLessThan(basePricingInput.geometry.volumeCm3 * 1.3);
    });
  });

  describe('cost breakdown accuracy', () => {
    it('should include all post-processing costs', () => {
      const result = calculator.calculate(basePricingInput);
      const breakdown = result.costBreakdown;

      // Labor should include washing, curing, and support removal
      const minPostProcessingCost = defaultConfig.laborRatePerHour.mul(0.5); // 30 min minimum
      expect(breakdown.labor.toNumber()).toBeGreaterThan(minPostProcessingCost.toNumber());
    });

    it('should calculate energy for printing and curing', () => {
      const result = calculator.calculate(basePricingInput);

      // SLA uses less power during printing but needs UV curing
      expect(result.costBreakdown.energy.toNumber()).toBeGreaterThan(0);
      expect(result.costBreakdown.energy.toNumber()).toBeLessThan(5); // Should be reasonable
    });
  });

  describe('sustainability calculations', () => {
    it('should account for higher resin CO2e factor', () => {
      const result = calculator.calculate(basePricingInput);
      const sustainability = result.sustainability;

      // Resin typically has higher CO2e than FFF materials
      expect(sustainability.co2e.material).toBeGreaterThan(0);
      expect(sustainability.co2e.total).toBeGreaterThan(sustainability.co2e.material);
    });

    it('should calculate waste including supports and failed prints', () => {
      const result = calculator.calculate({
        ...basePricingInput,
        selections: { ...basePricingInput.selections, supportsRequired: true },
      });

      expect(result.sustainability.wastePercent).toBeGreaterThan(10); // SLA typically has more waste
      expect(result.sustainability.wastePercent).toBeLessThan(50);
    });

    it('should penalize score for non-recyclable resin', () => {
      const result = calculator.calculate(basePricingInput);

      // Standard resin is not recyclable, should have lower score
      expect(result.sustainability.score).toBeLessThan(70);
    });
  });

  describe('edge cases', () => {
    it('should handle biocompatible resins with special handling', () => {
      const bioResin = calculator.calculate({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          name: 'BioMed Clear',
          code: 'RESIN-BIO',
          pricePerUom: 300,
        },
        selections: {
          ...basePricingInput.selections,
          material: 'BioMed Clear',
          biocompatible: true,
        },
      });

      expect(bioResin.unitPrice.toNumber()).toBeGreaterThan(
        calculator.calculate(basePricingInput).unitPrice.toNumber() * 2,
      );
      expect(bioResin.warnings).toContain('Biocompatible material requires special handling');
    });

    it('should handle very fine details', () => {
      const detailedPart = calculator.calculate({
        ...basePricingInput,
        geometry: {
          volumeCm3: 3,
          surfaceAreaCm2: 80, // High surface area to volume ratio
          bboxMm: { x: 20, y: 20, z: 30 },
        },
        selections: { ...basePricingInput.selections, layerHeight: 0.025 },
      });

      expect(detailedPart.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(detailedPart.warnings).toContain('High detail part may require careful orientation');
    });

    it('should handle clear resins with extended curing', () => {
      const clearResin = calculator.calculate({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          name: 'Clear Resin',
          code: 'RESIN-CLEAR',
        },
        selections: { ...basePricingInput.selections, material: 'Clear Resin' },
      });

      // Clear resin needs more post-processing
      expect(clearResin.costBreakdown.labor.toNumber()).toBeGreaterThan(
        calculator.calculate(basePricingInput).costBreakdown.labor.toNumber(),
      );
    });
  });
});
