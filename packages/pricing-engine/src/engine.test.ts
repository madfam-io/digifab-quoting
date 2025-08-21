import { Decimal } from 'decimal.js';
import { PricingEngine } from './engine';
import { PricingInput, TenantPricingConfig } from './types';

describe('PricingEngine', () => {
  let engine: PricingEngine;
  let defaultConfig: TenantPricingConfig;

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
  });

  describe('FFF Pricing', () => {
    it('should calculate price for simple FFF part', () => {
      const input: PricingInput = {
        process: '3d_fff',
        geometry: {
          volumeCm3: 10,
          surfaceAreaCm2: 50,
          bboxMm: { x: 50, y: 50, z: 40 },
        },
        material: {
          id: '1',
          tenantId: '1',
          process: '3d_fff',
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
          process: '3d_fff',
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
        process: '3d_fff',
        geometry: {
          volumeCm3: 10,
          surfaceAreaCm2: 50,
          bboxMm: { x: 50, y: 50, z: 40 },
        },
        material: {
          id: '1',
          tenantId: '1',
          process: '3d_fff',
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
          process: '3d_fff',
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
        process: '3d_fff',
        geometry: {
          volumeCm3: 10,
          surfaceAreaCm2: 50,
          bboxMm: { x: 50, y: 50, z: 40 },
        },
        material: {
          id: '1',
          tenantId: '1',
          process: '3d_fff',
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
          process: '3d_fff',
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

  describe('Batch Processing', () => {
    it('should process multiple inputs', () => {
      const inputs: PricingInput[] = [
        {
          process: '3d_fff',
          geometry: {
            volumeCm3: 10,
            surfaceAreaCm2: 50,
            bboxMm: { x: 50, y: 50, z: 40 },
          },
          material: {
            id: '1',
            tenantId: '1',
            process: '3d_fff',
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
            process: '3d_fff',
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
          process: '3d_sla',
          geometry: {
            volumeCm3: 5,
            surfaceAreaCm2: 30,
            bboxMm: { x: 30, y: 30, z: 50 },
          },
          material: {
            id: '2',
            tenantId: '1',
            process: '3d_sla',
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
            process: '3d_sla',
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
  });
});