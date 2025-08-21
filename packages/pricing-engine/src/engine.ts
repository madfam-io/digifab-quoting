import { ProcessType } from '@madfam/shared';
import { PricingInput, PricingResult } from './types';
import {
  FFFPricingCalculator,
  SLAPricingCalculator,
  CNCPricingCalculator,
  LaserPricingCalculator,
} from './calculators';

export class PricingEngine {
  private calculators: Record<string, typeof FFFPricingCalculator> = {
    [ProcessType.FFF]: FFFPricingCalculator,
    [ProcessType.SLA]: SLAPricingCalculator,
    [ProcessType.CNC_3AXIS]: CNCPricingCalculator,
    [ProcessType.LASER_2D]: LaserPricingCalculator,
  };

  calculate(input: PricingInput): PricingResult {
    const CalculatorClass = this.calculators[input.process as string];
    
    if (!CalculatorClass) {
      throw new Error(`No calculator found for process: ${input.process}`);
    }

    const calculator = new CalculatorClass(input);
    return calculator.calculate();
  }

  calculateBatch(inputs: PricingInput[]): PricingResult[] {
    return inputs.map(input => this.calculate(input));
  }

  async calculateAsync(input: PricingInput): Promise<PricingResult> {
    return new Promise((resolve, reject) => {
      try {
        const result = this.calculate(input);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  async calculateBatchAsync(
    inputs: PricingInput[],
    concurrency: number = 5
  ): Promise<PricingResult[]> {
    const results: PricingResult[] = [];
    
    for (let i = 0; i < inputs.length; i += concurrency) {
      const batch = inputs.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(input => this.calculateAsync(input))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  getSupportedProcesses(): ProcessType[] {
    return Object.keys(this.calculators) as ProcessType[];
  }

  validateInput(input: PricingInput): string[] {
    const errors: string[] = [];

    if (!input.process) {
      errors.push('Process type is required');
    } else if (!this.calculators[input.process as string]) {
      errors.push(`Unsupported process type: ${input.process}`);
    }

    if (!input.geometry) {
      errors.push('Geometry metrics are required');
    } else {
      if (!input.geometry.volumeCm3 || input.geometry.volumeCm3 <= 0) {
        errors.push('Volume must be positive');
      }
      if (!input.geometry.surfaceAreaCm2 || input.geometry.surfaceAreaCm2 <= 0) {
        errors.push('Surface area must be positive');
      }
    }

    if (!input.material) {
      errors.push('Material is required');
    }

    if (!input.machine) {
      errors.push('Machine is required');
    }

    if (!input.quantity || input.quantity <= 0) {
      errors.push('Quantity must be positive');
    }

    if (!input.tenantConfig) {
      errors.push('Tenant configuration is required');
    }

    return errors;
  }
}