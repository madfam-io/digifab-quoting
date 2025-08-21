import { UUID, Currency, Timestamped, TenantScoped } from './common';

export type QuoteStatus = 
  | 'draft'
  | 'submitted'
  | 'auto_quoted'
  | 'needs_review'
  | 'quoted'
  | 'approved'
  | 'ordered'
  | 'in_production'
  | 'qc'
  | 'shipped'
  | 'closed'
  | 'cancelled';

export type ProcessType = '3d_fff' | '3d_sla' | 'cnc_3axis' | 'laser_2d';

export interface QuoteObjective {
  cost: number;
  lead: number;
  green: number;
}

export interface Quote extends Timestamped, TenantScoped {
  id: UUID;
  customerId?: UUID;
  status: QuoteStatus;
  currency: Currency;
  objective: QuoteObjective;
  validityUntil: string;
  totals?: QuoteTotals;
  sustainability?: SustainabilityMetrics;
  items: QuoteItem[];
}

export interface QuoteTotals {
  subtotal: number;
  tax: number;
  shipping?: number;
  discount?: number;
  grandTotal: number;
  currency: Currency;
}

export interface QuoteItem {
  id: UUID;
  quoteId: UUID;
  name: string;
  process: ProcessType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  leadDays: number;
  selections: QuoteItemSelections;
  costBreakdown: CostBreakdown;
  sustainability: SustainabilityMetrics;
  flags?: string[];
  files: FileReference[];
  dfmReport?: DFMReport;
}

export interface QuoteItemSelections {
  material: string;
  finish?: string;
  tolerance?: string;
  layerHeight?: number;
  infill?: number;
  [key: string]: any;
}

export interface CostBreakdown {
  material: number;
  machine: number;
  energy: number;
  post: number;
  overhead: number;
  margin: number;
}

export interface SustainabilityMetrics {
  score: number;
  co2eKg: number;
  energyKwh: number;
  recycledPercent: number;
  wastePercent: number;
}

export interface FileReference {
  id: UUID;
  filename: string;
  type: FileType;
  size: number;
  path: string;
  hash: string;
  uploadedAt: string;
}

export type FileType = 'stl' | 'step' | 'iges' | 'dxf' | 'dwg' | 'pdf';

export interface DFMReport {
  id: UUID;
  quoteItemId: UUID;
  metrics: GeometryMetrics;
  issues: DFMIssue[];
  riskScore: number;
}

export interface GeometryMetrics {
  volumeCm3: number;
  surfaceAreaCm2: number;
  bboxMm: {
    x: number;
    y: number;
    z: number;
  };
  lengthCutMm?: number;
  holesCount?: number;
  overhangArea?: number;
}

export interface DFMIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  location?: string;
}