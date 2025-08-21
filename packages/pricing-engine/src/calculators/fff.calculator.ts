import { Decimal } from 'decimal.js';
import { BasePricingCalculator } from './base.calculator';
import { 
  PricingResult, 
  ProcessingTime, 
  MaterialUsage 
} from '../types';

export class FFFPricingCalculator extends BasePricingCalculator {
  calculate(): PricingResult {
    const time = this.calculateProcessingTime();
    const usage = this.calculateMaterialUsage();

    // Calculate costs
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

    // Calculate sustainability
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
      confidence: 0.95, // High confidence for FFF
      warnings: this.generateWarnings(usage, time),
    };
  }

  calculateProcessingTime(): ProcessingTime {
    const { geometry, selections, machine } = this.input;
    
    // Layer height affects print time significantly
    const layerHeight = selections.layerHeight || 0.2;
    const layerCount = Math.ceil(geometry.bboxMm.z / layerHeight);
    
    // Simplified deposition rate calculation
    const depositionRateCm3PerHr = 12; // Default for standard FFF
    const volumeCm3 = geometry.volumeCm3 * (selections.infill || 35) / 100;
    const printHours = volumeCm3 / depositionRateCm3PerHr;
    
    // Quality factor adjustment
    const qualityFactor = layerHeight <= 0.1 ? 1.5 : 1.0;
    
    const setupMinutes = machine.setupMinutes;
    const processingMinutes = Math.ceil(printHours * 60 * qualityFactor);
    const postProcessingMinutes = this.calculatePostProcessing();
    
    return {
      setupMinutes,
      processingMinutes,
      postProcessingMinutes,
      totalMinutes: setupMinutes + processingMinutes + postProcessingMinutes,
    };
  }

  calculateMaterialUsage(): MaterialUsage {
    const { geometry, selections } = this.input;
    
    const infillPercent = selections.infill || 35;
    const netVolumeCm3 = geometry.volumeCm3 * infillPercent / 100;
    
    // Add support material if needed (simplified)
    const needsSupport = geometry.overhangArea && geometry.overhangArea > 0;
    const supportVolumeCm3 = needsSupport ? geometry.volumeCm3 * 0.1 : 0;
    
    // Add waste factor (raft, purge, etc.)
    const wasteFactor = 0.05; // 5% waste
    const grossVolumeCm3 = (netVolumeCm3 + supportVolumeCm3) * (1 + wasteFactor);
    
    return {
      netVolumeCm3,
      grossVolumeCm3,
      wasteFactor,
      supportVolumeCm3,
    };
  }

  private calculatePostProcessing(): number {
    const { geometry } = this.input;
    
    let minutes = 5; // Base removal from bed
    
    // Support removal if needed
    if (geometry.overhangArea && geometry.overhangArea > 0) {
      minutes += 10;
    }
    
    // Basic cleanup
    minutes += 5;
    
    return minutes;
  }

  private generateWarnings(usage: MaterialUsage, time: ProcessingTime): string[] {
    const warnings: string[] = [];
    const { geometry, selections } = this.input;
    
    // Check if part is too large
    const maxDimension = Math.max(geometry.bboxMm.x, geometry.bboxMm.y, geometry.bboxMm.z);
    if (maxDimension > 250) {
      warnings.push('Part dimensions exceed typical build volume');
    }
    
    // Check if print time is very long
    if (time.processingMinutes > 1440) { // 24 hours
      warnings.push('Print time exceeds 24 hours');
    }
    
    // Check if layer height is very fine
    if (selections.layerHeight && selections.layerHeight < 0.1) {
      warnings.push('Very fine layer height will significantly increase print time');
    }
    
    // Check if support is substantial
    if (usage.supportVolumeCm3 && usage.supportVolumeCm3 > usage.netVolumeCm3 * 0.3) {
      warnings.push('Significant support material required');
    }
    
    return warnings;
  }
}