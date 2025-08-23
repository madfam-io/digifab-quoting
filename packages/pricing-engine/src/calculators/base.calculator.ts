import { Decimal } from 'decimal.js';
import {
  PricingInput,
  PricingResult,
  CostBreakdown,
  ProcessingTime,
  MaterialUsage,
  SustainabilityResult,
} from '../types';

export abstract class BasePricingCalculator {
  protected input: PricingInput;

  constructor(input: PricingInput) {
    this.input = input;
  }

  abstract calculate(): PricingResult;
  abstract calculateProcessingTime(): ProcessingTime;
  abstract calculateMaterialUsage(): MaterialUsage;

  protected calculateMaterialCost(usage: MaterialUsage): Decimal {
    const { material } = this.input;
    const massKg = new Decimal(usage.grossVolumeCm3).mul(material.density).div(1000); // g to kg

    return massKg.mul(material.pricePerUom);
  }

  protected calculateMachineCost(time: ProcessingTime): Decimal {
    const { machine } = this.input;
    const hoursTotal = new Decimal(time.totalMinutes).div(60);

    return hoursTotal.mul(machine.hourlyRate);
  }

  protected calculateEnergyCost(time: ProcessingTime): Decimal {
    const { machine, tenantConfig } = this.input;
    const hoursProcessing = new Decimal(time.processingMinutes).div(60);
    const energyKwh = hoursProcessing.mul(machine.powerW).div(1000);

    return energyKwh.mul(tenantConfig.energyTariffPerKwh);
  }

  protected calculateLaborCost(time: ProcessingTime): Decimal {
    const { tenantConfig } = this.input;
    const laborMinutes = time.setupMinutes + time.postProcessingMinutes;
    const laborHours = new Decimal(laborMinutes).div(60);

    return laborHours.mul(tenantConfig.laborRatePerHour);
  }

  protected calculateOverheadCost(subtotal: Decimal): Decimal {
    const { tenantConfig } = this.input;
    return subtotal.mul(tenantConfig.overheadPercent).div(100);
  }

  protected calculateMargin(costTotal: Decimal): Decimal {
    const { tenantConfig } = this.input;
    return costTotal.mul(tenantConfig.marginFloorPercent).div(100);
  }

  protected calculateVolumeDiscount(basePrice: Decimal): Decimal {
    const { quantity, tenantConfig } = this.input;
    const applicableDiscount = tenantConfig.volumeDiscounts
      .filter((d) => quantity >= d.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0];

    if (applicableDiscount) {
      return basePrice.mul(applicableDiscount.discountPercent).div(100);
    }

    return new Decimal(0);
  }

  protected calculateSustainability(
    energyKwh: Decimal,
    materialUsage: MaterialUsage,
  ): SustainabilityResult {
    const { material, tenantConfig } = this.input;

    // Calculate CO2e from energy
    const energyCo2e = energyKwh.mul(tenantConfig.gridCo2eFactor);

    // Calculate CO2e from material
    const materialMassKg = new Decimal(materialUsage.grossVolumeCm3)
      .mul(material.density)
      .div(1000);
    const materialCo2e = materialMassKg.mul(material.co2eFactor);

    // Calculate logistics CO2e (simplified)
    const logisticsCo2e = materialMassKg.mul(100).mul(tenantConfig.logisticsCo2eFactor);

    const totalCo2e = energyCo2e.plus(materialCo2e).plus(logisticsCo2e);

    // Calculate waste percentage
    const wastePercent =
      ((materialUsage.grossVolumeCm3 - materialUsage.netVolumeCm3) / materialUsage.grossVolumeCm3) *
      100;

    // Calculate sustainability score (0-100)
    // This is a simplified scoring algorithm
    const co2eScore = Math.max(0, 100 - totalCo2e.toNumber() * 10);
    const wasteScore = Math.max(0, 100 - wastePercent * 2);
    const recycledScore = material.recycledPercent || 0;

    const score = Math.round(co2eScore * 0.5 + wasteScore * 0.3 + recycledScore * 0.2);

    return {
      score,
      co2eKg: totalCo2e,
      energyKwh,
      recycledPercent: material.recycledPercent || 0,
      wastePercent: Math.round(wastePercent),
    };
  }

  protected calculateLeadTime(): number {
    // Simplified lead time calculation
    const { quantity, requiredByDate } = this.input;

    if (requiredByDate) {
      const daysUntilRequired = Math.ceil(
        (requiredByDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilRequired <= 3) {
        return 2; // Rush
      }
    }

    // Standard lead times based on quantity
    if (quantity <= 10) return 3;
    if (quantity <= 50) return 5;
    if (quantity <= 100) return 7;
    return 10;
  }

  protected buildCostBreakdown(
    material: Decimal,
    machine: Decimal,
    energy: Decimal,
    labor: Decimal,
    overhead: Decimal,
    margin: Decimal,
    discount?: Decimal,
  ): CostBreakdown {
    return {
      material,
      machine,
      energy,
      labor,
      overhead,
      margin,
      discount,
    };
  }
}
