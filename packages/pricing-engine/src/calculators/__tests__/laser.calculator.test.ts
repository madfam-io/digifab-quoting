import { Decimal } from 'decimal.js';
import { LaserPricingCalculator } from '../laser.calculator';
import { PricingInput, TenantPricingConfig } from '../../types';
import { ProcessType } from '@cotiza/shared';

describe('LaserPricingCalculator', () => {
  let calculator: LaserPricingCalculator;
  let defaultConfig: TenantPricingConfig;
  let basePricingInput: PricingInput;

  beforeEach(() => {
    calculator = new LaserPricingCalculator();
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
      process: ProcessType.LASER_2D,
      geometry: {
        volumeCm3: 12, // 100x100x1.2mm sheet
        surfaceAreaCm2: 200, // Both sides
        bboxMm: { x: 100, y: 100, z: 1.2 },
        perimeterMm: 400,
        cutLengthMm: 800, // Total cutting path
        pierceCount: 5, // Number of pierce points
      },
      material: {
        id: '4',
        tenantId: '1',
        process: ProcessType.LASER_2D,
        name: 'Mild Steel',
        code: 'MS-1.2',
        density: 7.85,
        co2eFactor: 2.3,
        costUom: 'kg',
        pricePerUom: 1.5,
        recycledPercent: 20,
        active: true,
        thickness: 1.2, // mm
        versionEffectiveFrom: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      machine: {
        id: '4',
        tenantId: '1',
        process: ProcessType.LASER_2D,
        model: 'Trumpf TruLaser 3030',
        name: 'Laser Cutter 1',
        powerW: 4000,
        hourlyRate: 85,
        setupMinutes: 15,
        active: true,
        specs: {
          bedSize: { x: 3000, y: 1500 },
          maxThickness: {
            mildSteel: 20,
            stainlessSteel: 12,
            aluminum: 10,
            acrylic: 25,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      selections: {
        material: 'Mild Steel',
        thickness: 1.2,
        quantity: 1,
      },
      quantity: 1,
      tenantConfig: defaultConfig,
    };
  });

  describe('calculate', () => {
    it('should calculate pricing for a standard laser cut part', () => {
      const result = calculator.calculate(basePricingInput);

      expect(result).toBeDefined();
      expect(result.unitPrice).toBeInstanceOf(Decimal);
      expect(result.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(result.leadDays).toBe(2); // Laser cutting is fast
      expect(result.costBreakdown).toBeDefined();
      expect(result.costBreakdown.material).toBeInstanceOf(Decimal);
      expect(result.costBreakdown.machine).toBeInstanceOf(Decimal);
      expect(result.costBreakdown.energy).toBeInstanceOf(Decimal);
      expect(result.sustainability.score).toBeGreaterThan(0);
    });

    it('should handle different material thicknesses', () => {
      const thickMaterial = calculator.calculate({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          thickness: 6,
          code: 'MS-6',
        },
        geometry: {
          ...basePricingInput.geometry,
          volumeCm3: 60, // 6mm thick
          bboxMm: { ...basePricingInput.geometry.bboxMm, z: 6 },
        },
        selections: { ...basePricingInput.selections, thickness: 6 },
      });

      const thinMaterial = calculator.calculate(basePricingInput);

      // Thicker material takes longer to cut
      expect(thickMaterial.costBreakdown.machine.toNumber()).toBeGreaterThan(
        thinMaterial.costBreakdown.machine.toNumber() * 3,
      );
    });

    it('should calculate based on cut length and pierce count', () => {
      const complexCut = calculator.calculate({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          cutLengthMm: 2000,
          pierceCount: 20,
        },
      });

      const simpleCut = calculator.calculate({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          cutLengthMm: 400,
          pierceCount: 1,
        },
      });

      expect(complexCut.unitPrice.toNumber()).toBeGreaterThan(simpleCut.unitPrice.toNumber() * 2);
      expect(complexCut.costBreakdown.machine.toNumber()).toBeGreaterThan(
        simpleCut.costBreakdown.machine.toNumber() * 3,
      );
    });

    it('should handle different materials with varying cutting speeds', () => {
      const stainlessSteel = calculator.calculate({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          name: 'Stainless Steel 304',
          code: 'SS304-1.5',
          density: 8.0,
          thickness: 1.5,
          pricePerUom: 4,
        },
        selections: {
          ...basePricingInput.selections,
          material: 'Stainless Steel 304',
          thickness: 1.5,
        },
      });

      const mildSteel = calculator.calculate(basePricingInput);

      // Stainless steel cuts slower than mild steel
      expect(stainlessSteel.costBreakdown.machine.toNumber()).toBeGreaterThan(
        mildSteel.costBreakdown.machine.toNumber(),
      );
    });

    it('should handle non-metal materials', () => {
      const acrylic = calculator.calculate({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          name: 'Acrylic Clear',
          code: 'ACRYLIC-3',
          density: 1.19,
          thickness: 3,
          pricePerUom: 25,
          co2eFactor: 5.5,
        },
        geometry: {
          ...basePricingInput.geometry,
          volumeCm3: 30,
          bboxMm: { ...basePricingInput.geometry.bboxMm, z: 3 },
        },
        selections: {
          ...basePricingInput.selections,
          material: 'Acrylic Clear',
          thickness: 3,
        },
      });

      expect(acrylic.unitPrice.toNumber()).toBeGreaterThan(0);
      // Acrylic cuts faster than steel
      expect(acrylic.costBreakdown.machine.toNumber()).toBeLessThan(
        calculator.calculate(basePricingInput).costBreakdown.machine.toNumber(),
      );
    });

    it('should apply minimum charge for small cuts', () => {
      const tinyCut = calculator.calculate({
        ...basePricingInput,
        geometry: {
          volumeCm3: 0.12, // 10x10x1.2mm
          surfaceAreaCm2: 2,
          bboxMm: { x: 10, y: 10, z: 1.2 },
          perimeterMm: 40,
          cutLengthMm: 40,
          pierceCount: 1,
        },
      });

      expect(tinyCut.unitPrice.toNumber()).toBeGreaterThanOrEqual(15); // Minimum for laser
      expect(tinyCut.warnings).toContain('Minimum charge applied');
    });

    it('should optimize for sheet nesting', () => {
      const multiplePartsOnSheet = calculator.calculate({
        ...basePricingInput,
        quantity: 10,
        geometry: {
          ...basePricingInput.geometry,
          nestingEfficiency: 0.85, // 85% material utilization
        },
      });

      const singlePart = calculator.calculate(basePricingInput);

      // Better material utilization should reduce cost per part
      expect(multiplePartsOnSheet.unitPrice.toNumber()).toBeLessThan(
        singlePart.unitPrice.toNumber(),
      );
    });
  });

  describe('calculateProcessingTime', () => {
    it('should calculate cutting time based on material and thickness', () => {
      const time = calculator.calculateProcessingTime(basePricingInput);

      expect(time.toNumber()).toBeGreaterThan(0);
      expect(time.toNumber()).toBeLessThan(1); // Should be fast for thin material
    });

    it('should increase time for thicker materials', () => {
      const thickTime = calculator.calculateProcessingTime({
        ...basePricingInput,
        material: { ...basePricingInput.material, thickness: 10 },
        selections: { ...basePricingInput.selections, thickness: 10 },
      });

      const thinTime = calculator.calculateProcessingTime({
        ...basePricingInput,
        material: { ...basePricingInput.material, thickness: 1 },
        selections: { ...basePricingInput.selections, thickness: 1 },
      });

      expect(thickTime.toNumber()).toBeGreaterThan(thinTime.toNumber() * 5);
    });

    it('should account for pierce time', () => {
      const manyPierces = calculator.calculateProcessingTime({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          pierceCount: 50,
        },
      });

      const fewPierces = calculator.calculateProcessingTime({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          pierceCount: 2,
        },
      });

      expect(manyPierces.toNumber()).toBeGreaterThan(fewPierces.toNumber());
    });
  });

  describe('calculateMaterialUsage', () => {
    it('should calculate sheet material requirement', () => {
      const usage = calculator.calculateMaterialUsage(basePricingInput);

      // Should include kerf width and edge margin
      expect(usage.toNumber()).toBeGreaterThan(basePricingInput.geometry.volumeCm3);
    });

    it('should optimize for nesting efficiency', () => {
      const efficientNesting = calculator.calculateMaterialUsage({
        ...basePricingInput,
        quantity: 20,
        geometry: {
          ...basePricingInput.geometry,
          nestingEfficiency: 0.9,
        },
      });

      const poorNesting = calculator.calculateMaterialUsage({
        ...basePricingInput,
        quantity: 20,
        geometry: {
          ...basePricingInput.geometry,
          nestingEfficiency: 0.6,
        },
      });

      expect(efficientNesting.toNumber()).toBeLessThan(poorNesting.toNumber() * 0.7);
    });

    it('should account for kerf width', () => {
      const thickKerf = calculator.calculateMaterialUsage({
        ...basePricingInput,
        material: { ...basePricingInput.material, thickness: 10 }, // Thicker = wider kerf
      });

      const thinKerf = calculator.calculateMaterialUsage({
        ...basePricingInput,
        material: { ...basePricingInput.material, thickness: 0.5 },
      });

      // Relative difference accounting for volume
      const thickKerfPerVolume = thickKerf.div(10);
      const thinKerfPerVolume = thinKerf.div(0.5);

      expect(thickKerfPerVolume.toNumber()).toBeGreaterThan(thinKerfPerVolume.toNumber());
    });
  });

  describe('cost breakdown accuracy', () => {
    it('should calculate assist gas costs', () => {
      const result = calculator.calculate(basePricingInput);

      // Energy cost should include laser power + assist gas
      expect(result.costBreakdown.energy.toNumber()).toBeGreaterThan(0);

      // For steel cutting, assist gas is significant
      const minGasCost = result.costBreakdown.machine.mul(0.1); // ~10% of machine cost
      expect(result.costBreakdown.energy.toNumber()).toBeGreaterThan(minGasCost.toNumber());
    });

    it('should include sheet handling in labor', () => {
      const result = calculator.calculate(basePricingInput);

      // Laser cutting needs minimal labor
      expect(result.costBreakdown.labor.toNumber()).toBeGreaterThan(0);
      expect(result.costBreakdown.labor.toNumber()).toBeLessThan(
        defaultConfig.laborRatePerHour.mul(0.5).toNumber(), // Less than 30 min
      );
    });
  });

  describe('sustainability calculations', () => {
    it('should have lower waste than subtractive processes', () => {
      const result = calculator.calculate(basePricingInput);

      // Laser cutting has minimal waste (just kerf)
      expect(result.sustainability.wastePercent).toBeLessThan(10);
      expect(result.sustainability.wastePercent).toBeGreaterThan(0);
    });

    it('should calculate energy CO2e including assist gas', () => {
      const result = calculator.calculate(basePricingInput);

      expect(result.sustainability.co2e.energy).toBeGreaterThan(0);
      // Laser uses significant power
      expect(result.sustainability.co2e.energy).toBeGreaterThan(
        result.sustainability.co2e.material * 0.2,
      );
    });

    it('should favor thinner materials in sustainability score', () => {
      const thinMaterial = calculator.calculate({
        ...basePricingInput,
        material: { ...basePricingInput.material, thickness: 0.5 },
        geometry: {
          ...basePricingInput.geometry,
          volumeCm3: 5,
          bboxMm: { ...basePricingInput.geometry.bboxMm, z: 0.5 },
        },
        selections: { ...basePricingInput.selections, thickness: 0.5 },
      });

      const thickMaterial = calculator.calculate({
        ...basePricingInput,
        material: { ...basePricingInput.material, thickness: 6 },
        geometry: {
          ...basePricingInput.geometry,
          volumeCm3: 60,
          bboxMm: { ...basePricingInput.geometry.bboxMm, z: 6 },
        },
        selections: { ...basePricingInput.selections, thickness: 6 },
      });

      expect(thinMaterial.sustainability.score).toBeGreaterThan(thickMaterial.sustainability.score);
    });
  });

  describe('edge cases', () => {
    it('should handle materials exceeding machine capacity', () => {
      const tooThick = calculator.calculate({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          thickness: 25, // Exceeds mild steel limit
        },
        selections: { ...basePricingInput.selections, thickness: 25 },
      });

      expect(tooThick.warnings).toContain('Material thickness exceeds machine capability');
      expect(tooThick.unitPrice.toNumber()).toBeGreaterThan(0);
    });

    it('should handle reflective materials with power adjustment', () => {
      const aluminum = calculator.calculate({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          name: 'Aluminum 5052',
          code: 'AL5052-2',
          density: 2.68,
          thickness: 2,
          reflectivity: 'high',
        },
        selections: {
          ...basePricingInput.selections,
          material: 'Aluminum 5052',
          thickness: 2,
        },
      });

      // Reflective materials need more power/time
      expect(aluminum.costBreakdown.machine.toNumber()).toBeGreaterThan(
        calculator.calculate(basePricingInput).costBreakdown.machine.toNumber(),
      );
    });

    it('should handle intricate cuts with many direction changes', () => {
      const intricateCut = calculator.calculate({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          cutLengthMm: 1000,
          complexity: 'high', // Many direction changes
          cornerCount: 100,
        },
      });

      const simpleCut = calculator.calculate({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          cutLengthMm: 1000,
          complexity: 'low',
          cornerCount: 4,
        },
      });

      // Complex paths require slower cutting
      expect(intricateCut.costBreakdown.machine.toNumber()).toBeGreaterThan(
        simpleCut.costBreakdown.machine.toNumber(),
      );
    });

    it('should handle wood/organic materials with special settings', () => {
      const plywood = calculator.calculate({
        ...basePricingInput,
        material: {
          ...basePricingInput.material,
          name: 'Plywood',
          code: 'PLY-6',
          density: 0.6,
          thickness: 6,
          pricePerUom: 50,
          co2eFactor: 0.8,
          organicMaterial: true,
        },
        selections: {
          ...basePricingInput.selections,
          material: 'Plywood',
          thickness: 6,
        },
      });

      expect(plywood.unitPrice.toNumber()).toBeGreaterThan(0);
      expect(plywood.warnings).toContain('Organic material may require multiple passes');
    });

    it('should handle very large sheets requiring repositioning', () => {
      const largeSheet = calculator.calculate({
        ...basePricingInput,
        geometry: {
          ...basePricingInput.geometry,
          bboxMm: { x: 2500, y: 1200, z: 2 },
          requiresRepositioning: true,
        },
      });

      expect(largeSheet.warnings).toContain('Large part may require sheet repositioning');
      expect(largeSheet.costBreakdown.labor.toNumber()).toBeGreaterThan(
        calculator.calculate(basePricingInput).costBreakdown.labor.toNumber(),
      );
    });
  });
});
