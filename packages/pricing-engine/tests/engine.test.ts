import { describe, it, expect, beforeEach } from '@jest/globals';
import { PricingEngine } from '../src/engine';
import { PricingInput } from '../src/types';
import { ProcessType } from '@cotiza/shared';
import { Decimal } from 'decimal.js';

describe('PricingEngine', () => {
  let engine: PricingEngine;
  let validInput: PricingInput;

  beforeEach(() => {
    engine = new PricingEngine();
    validInput = {
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
  });

  describe('calculate', () => {
    it('should calculate pricing for valid FFF input', () => {
      const result = engine.calculate(validInput);

      expect(result).toBeDefined();
      expect(result.unitPrice).toBeInstanceOf(Decimal);
      expect(result.totalPrice).toBeInstanceOf(Decimal);
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(result.leadDays).toBeGreaterThan(0);
      expect(result.costBreakdown).toBeDefined();
      expect(result.sustainability).toBeDefined();
    });

    it('should handle SLA process', () => {
      validInput.process = ProcessType.SLA;
      validInput.material = {
        id: 'resin-standard',
        name: 'Standard Resin',
        costPerKg: new Decimal(50),
        densityGCm3: 1.1,
        category: 'resin',
      };
      validInput.machine = {
        id: 'form3',
        name: 'Form 3',
        costPerHour: new Decimal(15),
        setupMinutes: 20,
        powerW: 65,
      };

      const result = engine.calculate(validInput);
      expect(result).toBeDefined();
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
    });

    it('should handle CNC process', () => {
      validInput.process = ProcessType.CNC_3AXIS;
      validInput.material = {
        id: 'aluminum-6061',
        name: 'Aluminum 6061',
        costPerKg: new Decimal(5),
        densityGCm3: 2.7,
        category: 'metal',
      };
      validInput.machine = {
        id: 'haas-vf2',
        name: 'Haas VF2',
        costPerHour: new Decimal(60),
        setupMinutes: 30,
        powerW: 15000,
      };

      const result = engine.calculate(validInput);
      expect(result).toBeDefined();
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
    });

    it('should handle laser cutting process', () => {
      validInput.process = ProcessType.LASER_2D;
      validInput.geometry.lengthCutMm = 1000;
      validInput.material = {
        id: 'acrylic-3mm',
        name: 'Acrylic 3mm',
        costPerKg: new Decimal(3),
        densityGCm3: 1.18,
        category: 'plastic',
      };
      validInput.machine = {
        id: 'epilog-fusion',
        name: 'Epilog Fusion',
        costPerHour: new Decimal(40),
        setupMinutes: 10,
        powerW: 120,
      };

      const result = engine.calculate(validInput);
      expect(result).toBeDefined();
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
    });

    it('should throw error for unsupported process', () => {
      validInput.process = 'INVALID_PROCESS' as ProcessType;
      expect(() => engine.calculate(validInput)).toThrow('No calculator found for process');
    });
  });

  describe('calculateBatch', () => {
    it('should calculate multiple inputs', () => {
      const inputs = [
        validInput,
        { ...validInput, quantity: 10 },
        { ...validInput, quantity: 100 },
      ];

      const results = engine.calculateBatch(inputs);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
      });

      // Volume discount should apply
      expect(results[2].unitPrice.toNumber()).toBeLessThan(results[0].unitPrice.toNumber());
    });
  });

  describe('validateInput', () => {
    it('should return no errors for valid input', () => {
      const errors = engine.validateInput(validInput);
      expect(errors).toHaveLength(0);
    });

    it('should validate missing process', () => {
      delete (validInput as any).process;
      const errors = engine.validateInput(validInput);
      expect(errors).toContain('Process type is required');
    });

    it('should validate missing geometry', () => {
      delete (validInput as any).geometry;
      const errors = engine.validateInput(validInput);
      expect(errors).toContain('Geometry metrics are required');
    });

    it('should validate invalid volume', () => {
      validInput.geometry.volumeCm3 = 0;
      const errors = engine.validateInput(validInput);
      expect(errors).toContain('Volume must be positive');
    });

    it('should validate missing material', () => {
      delete (validInput as any).material;
      const errors = engine.validateInput(validInput);
      expect(errors).toContain('Material is required');
    });

    it('should validate quantity', () => {
      validInput.quantity = -1;
      const errors = engine.validateInput(validInput);
      expect(errors).toContain('Quantity must be positive');
    });
  });

  describe('getSupportedProcesses', () => {
    it('should return all supported processes', () => {
      const processes = engine.getSupportedProcesses();
      expect(processes).toContain(ProcessType.FFF);
      expect(processes).toContain(ProcessType.SLA);
      expect(processes).toContain(ProcessType.CNC_3AXIS);
      expect(processes).toContain(ProcessType.LASER_2D);
    });
  });

  describe('async methods', () => {
    it('should calculate asynchronously', async () => {
      const result = await engine.calculateAsync(validInput);
      expect(result).toBeDefined();
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
    });

    it('should handle batch async with concurrency', async () => {
      const inputs = Array(20)
        .fill(null)
        .map((_, i) => ({
          ...validInput,
          quantity: i + 1,
        }));

      const results = await engine.calculateBatchAsync(inputs, 5);
      expect(results).toHaveLength(20);
    });
  });
});
