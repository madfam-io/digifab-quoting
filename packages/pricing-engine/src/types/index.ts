import {
  ProcessType,
  GeometryMetrics as BaseGeometryMetrics,
  Material as BaseMaterial,
  Machine,
  QuoteItemSelections,
} from '@cotiza/shared';
import { Decimal } from 'decimal.js';

// Extended geometry metrics for pricing calculations
export interface GeometryMetrics extends BaseGeometryMetrics {
  // Additional properties for specific processes
  perimeterMm?: number; // For 2D laser cutting
  cutLengthMm?: number; // For laser cutting
  pierceCount?: number; // For laser cutting
  features?: {
    holes?: number;
    pockets?: number;
    surfaces?: number;
    threads?: number;
    thinWalls?: boolean;
    wallThickness?: number;
  }; // For CNC machining
  nestingEfficiency?: number; // For sheet optimization
  complexity?: 'low' | 'medium' | 'high';
  cornerCount?: number;
  requiresRepositioning?: boolean;
}

// Extended material interface for pricing calculations
export interface Material extends BaseMaterial {
  // Additional properties for specific processes
  thickness?: number; // For sheet materials (laser, waterjet)
  reflectivity?: 'low' | 'medium' | 'high'; // For laser cutting
  organicMaterial?: boolean; // For laser cutting organic materials
}

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
  tooling?: Decimal;
  discount?: Decimal;
}

export interface SustainabilityResult {
  score: number;
  co2eKg: Decimal;
  energyKwh: Decimal;
  recycledPercent: number;
  wastePercent: number;
  co2e: {
    material: number;
    energy: number;
    logistics: number;
    total: number;
  };
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
