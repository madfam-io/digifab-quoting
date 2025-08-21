import { UUID, Timestamped, TenantScoped } from './common';
import { Currency, ProcessType } from './enums';

export interface Material extends Timestamped, TenantScoped {
  id: UUID;
  process: ProcessType;
  name: string;
  code: string;
  density: number; // g/cm³
  co2eFactor: number; // kg CO₂e/kg
  costUom: string;
  pricePerUom: number;
  recycledPercent?: number;
  active: boolean;
  versionEffectiveFrom: string;
  versionEffectiveTo?: string;
  properties?: Record<string, any>;
}

export interface Machine extends Timestamped, TenantScoped {
  id: UUID;
  process: ProcessType;
  model: string;
  name: string;
  powerW: number;
  hourlyRate: number;
  setupMinutes: number;
  active: boolean;
  specs: MachineSpecs;
}

export interface MachineSpecs {
  buildVolumeMm?: {
    x: number;
    y: number;
    z: number;
  };
  resolution?: number;
  maxSpeedMmPerMin?: number;
  [key: string]: any;
}

export interface ProcessOption extends TenantScoped {
  id: UUID;
  process: ProcessType;
  optionsSchema: any; // JSON schema
  marginFloorPercent: number;
  active: boolean;
}

export interface PricingRule extends Timestamped, TenantScoped {
  id: UUID;
  name: string;
  process: ProcessType;
  formula: string;
  parameters: Record<string, any>;
  active: boolean;
  priority: number;
  conditions?: RuleCondition[];
}

export interface RuleCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin';
  value: any;
}

export interface DiscountRule extends TenantScoped {
  id: UUID;
  name: string;
  scope: 'quote' | 'item' | 'customer';
  formula: string;
  thresholds: DiscountThreshold[];
  active: boolean;
}

export interface DiscountThreshold {
  min: number;
  max?: number;
  percent: number;
}

export interface FXRate {
  id: UUID;
  base: Currency;
  quote: Currency;
  rate: number;
  asOfDate: string;
  source: string;
  tenantId?: UUID;
}

export interface ShippingRate extends TenantScoped {
  id: UUID;
  carrier: string;
  serviceCode: string;
  serviceName: string;
  leadDays: number;
  priceFormula: string;
  zones?: ShippingZone[];
}

export interface ShippingZone {
  code: string;
  name: string;
  countries: string[];
  states?: string[];
}