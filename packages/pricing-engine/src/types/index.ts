import { ProcessType, GeometryMetrics, Material, Machine, QuoteItemSelections } from '@madfam/shared';
import { Decimal } from 'decimal.js';

export interface PricingInput {
  process: ProcessType;
  geometry: GeometryMetrics;
  material: Material;
  machine: Machine;
  selections: QuoteItemSelections;
  quantity: number;
  requiredByDate?: Date;
  tenantConfig: TenantPricingConfig;
}

export interface TenantPricingConfig {
  marginFloorPercent: Decimal;
  overheadPercent: Decimal;
  energyTariffPerKwh: Decimal;
  laborRatePerHour: Decimal;
  rushUpchargePercent: Decimal;
  volumeDiscounts: VolumeDiscount[];
  gridCo2eFactor: Decimal;
  logisticsCo2eFactor: Decimal;
}

export interface VolumeDiscount {
  minQuantity: number;
  discountPercent: Decimal;
}

export interface PricingResult {
  unitPrice: Decimal;
  totalPrice: Decimal;
  leadDays: number;
  costBreakdown: CostBreakdown;
  sustainability: SustainabilityResult;
  confidence: number;
  warnings: string[];
}

export interface CostBreakdown {
  material: Decimal;
  machine: Decimal;
  energy: Decimal;
  labor: Decimal;
  overhead: Decimal;
  margin: Decimal;
  discount?: Decimal;
}

export interface SustainabilityResult {
  score: number;
  co2eKg: Decimal;
  energyKwh: Decimal;
  recycledPercent: number;
  wastePercent: number;
}

export interface ProcessingTime {
  setupMinutes: number;
  processingMinutes: number;
  postProcessingMinutes: number;
  totalMinutes: number;
}

export interface MaterialUsage {
  netVolumeCm3: number;
  grossVolumeCm3: number;
  wasteFactor: number;
  supportVolumeCm3?: number;
}

export type PricingFormula = (input: PricingInput) => PricingResult;

export interface PricingRule {
  id: string;
  name: string;
  process: ProcessType;
  condition?: (input: PricingInput) => boolean;
  formula: PricingFormula;
  priority: number;
}