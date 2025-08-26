import { Decimal } from 'decimal.js';
import { PricingEngine } from './engine';
import { PricingInput, TenantPricingConfig } from './types';
import { ProcessType } from '@cotiza/shared';

describe('PricingEngine', () => {
  let engine: PricingEngine;
  let defaultConfig: TenantPricingConfig;
  let basePricingInput: PricingInput;

  beforeEach(() => {
    engine = new PricingEngine();
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

  describe('FFF Pricing', () => {
    it('should calculate price for simple FFF part', () => {
      const input: PricingInput = {
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

      const result = engine.calculate(input);

      expect(result).toBeDefined();
      expect(result.unitPrice).toBeInstanceOf(Decimal);
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(result.leadDays).toBeGreaterThan(0);
      expect(result.costBreakdown).toBeDefined();
      expect(result.sustainability).toBeDefined();
      expect(result.sustainability.score).toBeGreaterThanOrEqual(0);
      expect(result.sustainability.score).toBeLessThanOrEqual(100);
    });

    it('should apply volume discount for large quantities', () => {
      const baseInput: PricingInput = {
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

      const singleResult = engine.calculate(baseInput);
      const bulkResult = engine.calculate({ ...baseInput, quantity: 100 });

      const singleUnitPrice = singleResult.unitPrice.toNumber();
      const bulkUnitPrice = bulkResult.unitPrice.toNumber();

      expect(bulkUnitPrice).toBeLessThan(singleUnitPrice);
      expect(bulkResult.costBreakdown.discount).toBeDefined();
      expect(bulkResult.costBreakdown.discount!.toNumber()).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    it('should return errors for invalid input', () => {
      const invalidInput = {} as PricingInput;
      const errors = engine.validateInput(invalidInput);

      expect(errors).toContain('Process type is required');
      expect(errors).toContain('Geometry metrics are required');
      expect(errors).toContain('Material is required');
      expect(errors).toContain('Machine is required');
    });

    it('should return no errors for valid input', () => {
      const validInput: PricingInput = {
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
        },
        quantity: 1,
        tenantConfig: defaultConfig,
      };

      const errors = engine.validateInput(validInput);
      expect(errors).toHaveLength(0);
    });
  });

  describe('getSupportedProcesses', () => {
    it('should return all supported process types', () => {
      const processes = engine.getSupportedProcesses();

      expect(processes).toContain(ProcessType.FFF);
      expect(processes).toContain(ProcessType.SLA);
      expect(processes).toContain(ProcessType.CNC_3AXIS);
      expect(processes).toContain(ProcessType.LASER_2D);
      expect(processes).toHaveLength(4);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unsupported process type', () => {
      const invalidInput: PricingInput = {
        ...basePricingInput,
        process: 'invalid_process' as ProcessType,
      };

      expect(() => engine.calculate(invalidInput)).toThrow(
        'No calculator found for process: invalid_process',
      );
    });

    it('should handle calculator errors gracefully', () => {
      const invalidGeometry: PricingInput = {
        ...basePricingInput,
        geometry: {
          volumeCm3: -10, // Invalid negative volume
          surfaceAreaCm2: 50,
          bboxMm: { x: 50, y: 50, z: 40 },
        },
      };

      expect(() => engine.calculate(invalidGeometry)).not.toThrow();
      const result = engine.calculate(invalidGeometry);
      expect(result.warnings).toContain('Invalid geometry values');
    });
  });

  describe('Async Processing', () => {
    it('should calculate pricing asynchronously', async () => {
      const result = await engine.calculateAsync(basePricingInput);

      expect(result).toBeDefined();
      expect(result.unitPrice).toBeInstanceOf(Decimal);
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
    });

    it('should handle async errors', async () => {
      const invalidInput = {} as PricingInput;

      await expect(engine.calculateAsync(invalidInput)).rejects.toThrow();
    });

    it('should process batch asynchronously with concurrency control', async () => {
      const inputs: PricingInput[] = Array(10)
        .fill(null)
        .map((_, i) => ({
          ...basePricingInput,
          quantity: i + 1,
        }));

      const startTime = Date.now();
      const results = await engine.calculateBatchAsync(inputs, { concurrency: 3 });
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      results.forEach((result, i) => {
        expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
      });

      // Should process with controlled concurrency
      expect(endTime - startTime).toBeGreaterThan(50); // Some processing time
    });

    it('should handle mixed success/failure in batch async', async () => {
      const inputs: PricingInput[] = [
        basePricingInput,
        {} as PricingInput, // Invalid
        { ...basePricingInput, quantity: 10 },
      ];

      const results = await engine.calculateBatchAsync(inputs, { concurrency: 2 });

      expect(results).toHaveLength(3);
      expect(results[0].unitPrice.toNumber()).toBeGreaterThan(0);
      expect(results[1].warnings).toContain('Validation failed');
      expect(results[2].unitPrice.toNumber()).toBeGreaterThan(0);
    });
  });

  describe('Batch Processing', () => {
    it('should process multiple inputs', () => {
      const inputs: PricingInput[] = [
        {
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
          },
          quantity: 1,
          tenantConfig: defaultConfig,
        },
        {
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
            name: 'Resin Standard',
            code: 'RESIN-001',
            density: 1.15,
            co2eFactor: 6.0,
            costUom: 'l',
            pricePerUom: 80,
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
            specs: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          selections: {
            material: 'Resin Standard',
            layerHeight: 0.05,
          },
          quantity: 5,
          tenantConfig: defaultConfig,
        },
      ];

      const results = engine.calculateBatch(inputs);

      expect(results).toHaveLength(2);
      expect(results[0].unitPrice.toNumber()).toBeGreaterThan(0);
      expect(results[1].unitPrice.toNumber()).toBeGreaterThan(0);
    });

    it('should handle errors in batch processing', () => {
      const inputs: PricingInput[] = [
        basePricingInput,
        {} as PricingInput, // Invalid input
        {
          ...basePricingInput,
          process: ProcessType.CNC_3AXIS,
          material: {
            ...basePricingInput.material,
            process: ProcessType.CNC_3AXIS,
            name: 'Aluminum 6061',
            density: 2.7,
          },
          machine: {
            ...basePricingInput.machine,
            process: ProcessType.CNC_3AXIS,
            model: 'Haas VF-2',
            powerW: 15000,
            hourlyRate: 75,
          },
        },
      ];

      const results = engine.calculateBatch(inputs);

      expect(results).toHaveLength(3);
      expect(results[0].unitPrice.toNumber()).toBeGreaterThan(0);
      expect(results[1].warnings).toContain('Validation failed');
      expect(results[2].unitPrice.toNumber()).toBeGreaterThan(0);
    });
  });

  describe('Rush Order Handling', () => {
    it('should apply rush upcharge correctly', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const rushInput: PricingInput = {
        ...basePricingInput,
        requiredByDate: tomorrow,
      };

      const rushResult = engine.calculate(rushInput);
      const standardResult = engine.calculate(basePricingInput);

      const rushUpcharge = rushResult.unitPrice
        .sub(standardResult.unitPrice)
        .div(standardResult.unitPrice)
        .mul(100);

      expect(rushUpcharge.toNumber()).toBeCloseTo(50, 1); // 50% upcharge
      expect(rushResult.warnings).toContain('Rush order upcharge applied');
      expect(rushResult.leadDays).toBeLessThan(standardResult.leadDays);
    });
  });

  describe('Volume Discount Tiers', () => {
    it('should apply correct discount for each tier', () => {
      const quantities = [1, 10, 50, 100, 200];
      const expectedDiscounts = [0, 5, 10, 15, 15]; // No discount beyond 100

      quantities.forEach((qty, index) => {
        const result = engine.calculate({ ...basePricingInput, quantity: qty });

        if (qty === 1) {
          expect(result.costBreakdown.discount).toBeUndefined();
        } else {
          expect(result.costBreakdown.discount).toBeDefined();
          const discountPercent = result.costBreakdown
            .discount!.div(result.unitPrice.add(result.costBreakdown.discount!))
            .mul(100);
          expect(discountPercent.toNumber()).toBeCloseTo(expectedDiscounts[index], 1);
        }
      });
    });
  });

  describe('Cross-Process Pricing', () => {
    it('should price same geometry differently for each process', () => {
      const processes: ProcessType[] = [
        ProcessType.FFF,
        ProcessType.SLA,
        ProcessType.CNC_3AXIS,
        ProcessType.LASER_2D,
      ];
      const results: Record<string, number> = {};

      processes.forEach((process) => {
        try {
          const input: PricingInput = {
            ...basePricingInput,
            process,
            material: {
              ...basePricingInput.material,
              process,
              name:
                process === ProcessType.FFF
                  ? 'PLA'
                  : process === ProcessType.SLA
                    ? 'Standard Resin'
                    : process === ProcessType.CNC_3AXIS
                      ? 'Aluminum 6061'
                      : 'Mild Steel',
            },
            machine: {
              ...basePricingInput.machine,
              process,
              model:
                process === ProcessType.FFF
                  ? 'Prusa MK3S'
                  : process === ProcessType.SLA
                    ? 'Form 3'
                    : process === ProcessType.CNC_3AXIS
                      ? 'Haas VF-2'
                      : 'Trumpf Laser',
              hourlyRate:
                process === ProcessType.CNC_3AXIS || process === ProcessType.LASER_2D ? 75 : 25,
            },
          };

          const result = engine.calculate(input);
          results[process] = result.unitPrice.toNumber();
        } catch (e) {
          // Some processes might not work with base geometry
        }
      });

      // Verify different processes have different pricing
      const prices = Object.values(results);
      const uniquePrices = new Set(prices);
      expect(uniquePrices.size).toBeGreaterThan(1);
    });
  });

  describe('Margin Floor Enforcement', () => {
    it('should enforce minimum margin even with high material costs', () => {
      const expensiveMaterial: PricingInput = {
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          pricePerUom: 500, // Very expensive material
        },
      };

      const result = engine.calculate(expensiveMaterial);
      // Verify margin is enforced
      const totalCosts = result.costBreakdown.material
        .plus(result.costBreakdown.machine)
        .plus(result.costBreakdown.energy)
        .plus(result.costBreakdown.labor)
        .plus(result.costBreakdown.overhead);

      const marginPercent = result.costBreakdown.margin.div(result.unitPrice).mul(100);

      expect(marginPercent.toNumber()).toBeGreaterThanOrEqual(30);
    });
  });
});
