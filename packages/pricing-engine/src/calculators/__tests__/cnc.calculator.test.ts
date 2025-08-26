import { Decimal } from 'decimal.js';
import { CNCPricingCalculator } from '../cnc.calculator';
import { PricingInput, TenantPricingConfig } from '../../types';
import { ProcessType } from '@cotiza/shared';

describe('CNCPricingCalculator', () => {
  let calculator: CNCPricingCalculator;
  let defaultConfig: TenantPricingConfig;
  let basePricingInput: PricingInput;

  beforeEach(() => {
    calculator = new CNCPricingCalculator();
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
      process: ProcessType.CNC_3AXIS,
      geometry: {
        volumeCm3: 50,
        surfaceAreaCm2: 150,
        bboxMm: { x: 100, y: 50, z: 10 },
        features: {
          holes: 4,
          pockets: 2,
          surfaces: 6,
        },
      },
      material: {
        id: '3',
        tenantId: '1',
        process: ProcessType.CNC_3AXIS,
        name: 'Aluminum 6061',
        code: 'AL6061',
        density: 2.7,
        co2eFactor: 8.2,
        costUom: 'kg',
        pricePerUom: 5,
        recycledPercent: 30,
        active: true,
        versionEffectiveFrom: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      machine: {
        id: '3',
        tenantId: '1',
        process: ProcessType.CNC_3AXIS,
        model: 'Haas VF-2',
        name: 'CNC Mill 1',
        powerW: 15000,
        hourlyRate: 75,
        setupMinutes: 45,
        active: true,
        specs: {
          workEnvelope: { x: 500, y: 400, z: 300 },
          spindleSpeed: 10000,
          toolCapacity: 20,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      selections: {
        material: 'Aluminum 6061',
        tolerance: 'standard', // ±0.1mm
        surfaceFinish: 'as-machined',
      },
      quantity: 1,
      tenantConfig: defaultConfig,
    };
  });

  describe('calculate', () => {
    it('should calculate pricing for a standard CNC part', () => {
      const result = calculator.calculate(basePricingInput);

      expect(result).toBeDefined();
      expect(result.unitPrice).toBeInstanceOf(Decimal);
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(result.leadDays).toBe(5); // CNC typically needs more setup
      expect(result.costBreakdown).toBeDefined();
      expect(result.costBreakdown.material).toBeInstanceOf(Decimal);
      expect(result.costBreakdown.machine).toBeInstanceOf(Decimal);
      expect(result.costBreakdown.tooling).toBeInstanceOf(Decimal);
      expect(result.sustainability.score).toBeGreaterThan(0);
    });

    it('should handle different tolerance levels', () => {
      const tightTolerance = calculator.calculate({
        ...basePricingInput,
        selections: { ...basePricingInput.selections, tolerance: 'tight' }, // ±0.05mm
      });

      const looseTolerance = calculator.calculate({
        ...basePricingInput,
        selections: { ...basePricingInput.selections, tolerance: 'loose' }, // ±0.2mm
      });

      expect(tightTolerance.unitPrice.toNumber()).toBeGreaterThan(
        looseTolerance.unitPrice.toNumber(),
      );
      expect(tightTolerance.costBreakdown.machine.toNumber()).toBeGreaterThan(
        looseTolerance.costBreakdown.machine.toNumber(),
      );
    });

    it('should calculate material waste for CNC', () => {
      const result = calculator.calculate(basePricingInput);

      // CNC removes material, so stock volume > part volume
      const stockVolume =
        (basePricingInput.geometry.bboxMm.x *
          basePricingInput.geometry.bboxMm.y *
          basePricingInput.geometry.bboxMm.z) /
        1000; // cm³

      expect(result.costBreakdown.material.toNumber()).toBeGreaterThan(
        (basePricingInput.geometry.volumeCm3 *
          basePricingInput.material.density *
          basePricingInput.material.pricePerUom) /
          1000,
      );
    });

    it('should handle different surface finishes', () => {
      const polished = calculator.calculate({
        ...basePricingInput,
        selections: { ...basePricingInput.selections, surfaceFinish: 'polished' },
      });

      const asMachined = calculator.calculate({
        ...basePricingInput,
        selections: { ...basePricingInput.selections, surfaceFinish: 'as-machined' },
      });

      expect(polished.unitPrice.toNumber()).toBeGreaterThan(asMachined.unitPrice.toNumber());
      expect(polished.costBreakdown.labor.toNumber()).toBeGreaterThan(
        asMachined.costBreakdown.labor.toNumber(),
      );
    });

    it('should handle different materials with varying machinability', () => {
      const steelPart = calculator.calculate({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          name: 'Steel 1018',
          code: 'ST1018',
          density: 7.85,
          pricePerUom: 2,
        },
        selections: { ...basePricingInput.selections, material: 'Steel 1018' },
      });

      const aluminumPart = calculator.calculate(basePricingInput);

      // Steel is harder to machine, should take longer
      expect(steelPart.costBreakdown.machine.toNumber()).toBeGreaterThan(
        aluminumPart.costBreakdown.machine.toNumber(),
      );
    });

    it('should account for tooling costs', () => {
      const result = calculator.calculate(basePricingInput);

      expect(result.costBreakdown.tooling).toBeDefined();
      expect(result.costBreakdown.tooling!.toNumber()).toBeGreaterThan(0);

      // Tooling cost should be reasonable relative to total
      expect(result.costBreakdown.tooling!.toNumber()).toBeLessThan(
        result.unitPrice.toNumber() * 0.2,
      );
    });

    it('should handle complex geometries with many features', () => {
      const complexPart = calculator.calculate({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          features: {
            holes: 20,
            pockets: 10,
            surfaces: 15,
            threads: 5,
          },
        },
      });

      const simplePart = calculator.calculate({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          features: {
            holes: 1,
            pockets: 0,
            surfaces: 6,
          },
        },
      });

      expect(complexPart.unitPrice.toNumber()).toBeGreaterThan(
        simplePart.unitPrice.toNumber() * 1.5,
      );
      expect(complexPart.costBreakdown.machine.toNumber()).toBeGreaterThan(
        simplePart.costBreakdown.machine.toNumber() * 2,
      );
    });

    it('should apply minimum charge for small CNC parts', () => {
      const tinyPart = calculator.calculate({
        ...basePricingInput,
        geometry: {
          volumeCm3: 0.5,
          surfaceAreaCm2: 5,
          bboxMm: { x: 10, y: 10, z: 5 },
          features: { holes: 1, surfaces: 6 },
        },
      });

      expect(tinyPart.unitPrice.toNumber()).toBeGreaterThanOrEqual(50); // Higher minimum for CNC
      expect(tinyPart.warnings).toContain('Minimum charge applied');
    });
  });

  describe('calculateProcessingTime', () => {
    it('should calculate machining time based on MRR', () => {
      const time = calculator.calculateProcessingTime(basePricingInput);

      expect(time.toNumber()).toBeGreaterThan(0);
      expect(time.toNumber()).toBeLessThan(8); // Should be reasonable for medium part
    });

    it('should increase time for harder materials', () => {
      const steelTime = calculator.calculateProcessingTime({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          name: 'Stainless Steel 316',
          code: 'SS316',
          density: 8.0,
        },
        selections: { ...basePricingInput.selections, material: 'Stainless Steel 316' },
      });

      const aluminumTime = calculator.calculateProcessingTime(basePricingInput);

      expect(steelTime.toNumber()).toBeGreaterThan(aluminumTime.toNumber() * 2);
    });

    it('should account for feature complexity', () => {
      const complexTime = calculator.calculateProcessingTime({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          features: {
            holes: 30,
            pockets: 15,
            surfaces: 20,
            threads: 10,
          },
        },
      });

      const simpleTime = calculator.calculateProcessingTime({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          features: {
            holes: 2,
            surfaces: 6,
          },
        },
      });

      expect(complexTime.toNumber()).toBeGreaterThan(simpleTime.toNumber() * 3);
    });
  });

  describe('calculateMaterialUsage', () => {
    it('should calculate stock material requirement', () => {
      const usage = calculator.calculateMaterialUsage(basePricingInput);

      // Stock volume should be larger than part volume
      const minStockVolume =
        (basePricingInput.geometry.bboxMm.x *
          basePricingInput.geometry.bboxMm.y *
          basePricingInput.geometry.bboxMm.z) /
        1000;

      expect(usage.toNumber()).toBeGreaterThan(basePricingInput.geometry.volumeCm3);
      expect(usage.toNumber()).toBeGreaterThanOrEqual(minStockVolume);
    });

    it('should add stock margin for workholding', () => {
      const usage = calculator.calculateMaterialUsage(basePricingInput);

      const bbox = basePricingInput.geometry.bboxMm;
      const stockVolume = ((bbox.x + 10) * (bbox.y + 10) * (bbox.z + 5)) / 1000;

      expect(usage.toNumber()).toBeCloseTo(stockVolume, 1);
    });

    it('should handle thin parts with minimum stock thickness', () => {
      const thinPart = calculator.calculateMaterialUsage({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          bboxMm: { x: 100, y: 100, z: 1 }, // Very thin
        },
      });

      // Should enforce minimum stock thickness
      const minStockVolume = (100 * 100 * 3) / 1000; // 3mm minimum
      expect(thinPart.toNumber()).toBeGreaterThanOrEqual(minStockVolume);
    });
  });

  describe('cost breakdown accuracy', () => {
    it('should include setup costs in labor', () => {
      const result = calculator.calculate(basePricingInput);

      // CNC requires significant setup time
      const minSetupCost = defaultConfig.laborRatePerHour.mul(0.75); // 45 min setup
      expect(result.costBreakdown.labor.toNumber()).toBeGreaterThan(minSetupCost.toNumber());
    });

    it('should calculate high energy usage for CNC', () => {
      const result = calculator.calculate(basePricingInput);

      // CNC machines use significant power
      expect(result.costBreakdown.energy.toNumber()).toBeGreaterThan(5);
      expect(result.costBreakdown.energy.toNumber()).toBeLessThan(50);
    });

    it('should amortize tooling costs for batch production', () => {
      const singlePart = calculator.calculate(basePricingInput);
      const batchParts = calculator.calculate({
        ...basePricingInput,
        quantity: 50,
      });

      const singleToolingPerUnit = singlePart.costBreakdown.tooling!.toNumber();
      const batchToolingPerUnit = batchParts.costBreakdown.tooling!.toNumber();

      expect(batchToolingPerUnit).toBeLessThan(singleToolingPerUnit);
    });
  });

  describe('sustainability calculations', () => {
    it('should calculate waste percentage for subtractive process', () => {
      const result = calculator.calculate(basePricingInput);

      // CNC is subtractive, so waste is significant
      expect(result.sustainability.wastePercent).toBeGreaterThan(30);
      expect(result.sustainability.wastePercent).toBeLessThan(90);
    });

    it('should account for material recycling in score', () => {
      const recycledAluminum = calculator.calculate({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          recycledPercent: 80,
        },
      });

      const virginAluminum = calculator.calculate({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          recycledPercent: 0,
        },
      });

      expect(recycledAluminum.sustainability.score).toBeGreaterThan(
        virginAluminum.sustainability.score,
      );
    });

    it('should calculate high energy CO2e for CNC', () => {
      const result = calculator.calculate(basePricingInput);

      // CNC uses lots of energy
      expect(result.sustainability.co2e.energy).toBeGreaterThan(
        result.sustainability.co2e.material,
      );
    });
  });

  describe('edge cases', () => {
    it('should handle parts larger than machine envelope', () => {
      const oversizedPart = calculator.calculate({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          bboxMm: { x: 600, y: 500, z: 400 }, // Exceeds machine specs
        },
      });

      expect(oversizedPart.warnings).toContain('Part exceeds machine work envelope');
      expect(oversizedPart.unitPrice.toNumber()).toBeGreaterThan(0);
    });

    it('should handle plastics with different parameters', () => {
      const plasticPart = calculator.calculate({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          name: 'Delrin',
          code: 'POM',
          density: 1.41,
          pricePerUom: 15,
        },
        selections: { ...basePricingInput.selections, material: 'Delrin' },
      });

      expect(plasticPart.unitPrice.toNumber()).toBeGreaterThan(0);
      // Plastics machine faster than metals
      expect(plasticPart.costBreakdown.machine.toNumber()).toBeLessThan(
        calculator.calculate(basePricingInput).costBreakdown.machine.toNumber(),
      );
    });

    it('should handle very tight tolerances with warnings', () => {
      const precisionPart = calculator.calculate({
        ...basePricingInput,
        selections: {
          ...basePricingInput.selections,
          tolerance: 'precision', // ±0.01mm
        },
      });

      expect(precisionPart.warnings).toContain('Precision tolerance may require special tooling');
      expect(precisionPart.unitPrice.toNumber()).toBeGreaterThan(
        calculator.calculate(basePricingInput).unitPrice.toNumber() * 1.5,
      );
    });

    it('should handle thin-walled features', () => {
      const thinWalls = calculator.calculate({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          features: {
            ...basePricingInput.geometry.features,
            thinWalls: true,
            wallThickness: 0.5, // mm
          },
        },
      });

      expect(thinWalls.warnings).toContain('Thin walls require careful machining');
      expect(thinWalls.costBreakdown.machine.toNumber()).toBeGreaterThan(
        calculator.calculate(basePricingInput).costBreakdown.machine.toNumber(),
      );
    });
  });
});
