import { z } from 'zod';
import { uuidSchema, currencySchema, timestampedSchema, tenantScopedSchema } from './common';

export const quoteStatusSchema = z.enum([
  'draft',
  'submitted',
  'auto_quoted',
  'needs_review',
  'quoted',
  'approved',
  'ordered',
  'in_production',
  'qc',
  'shipped',
  'closed',
  'cancelled',
]);

export const processTypeSchema = z.enum(['3d_fff', '3d_sla', 'cnc_3axis', 'laser_2d']);

export const fileTypeSchema = z.enum(['stl', 'step', 'iges', 'dxf', 'dwg', 'pdf']);

export const quoteObjectiveSchema = z.object({
  cost: z.number().min(0).max(1),
  lead: z.number().min(0).max(1),
  green: z.number().min(0).max(1),
}).refine((obj) => Math.abs(obj.cost + obj.lead + obj.green - 1) < 0.01, {
  message: 'Objective weights must sum to 1',
});

export const createQuoteRequestSchema = z.object({
  currency: currencySchema,
  objective: quoteObjectiveSchema.default({ cost: 0.5, lead: 0.3, green: 0.2 }),
  customerId: uuidSchema.optional(),
});

export const fileUploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  type: fileTypeSchema,
  size: z.number().int().positive().max(200 * 1024 * 1024), // 200MB
});

export const quoteItemSelectionsSchema = z.object({
  material: z.string(),
  finish: z.string().optional(),
  tolerance: z.string().optional(),
  layerHeight: z.number().positive().optional(),
  infill: z.number().min(0).max(100).optional(),
}).passthrough();

export const addQuoteItemRequestSchema = z.object({
  fileId: uuidSchema,
  process: processTypeSchema,
  quantity: z.number().int().positive(),
  options: quoteItemSelectionsSchema,
  requiredBy: z.string().datetime().optional(),
});

export const calculateQuoteRequestSchema = z.object({
  objective: quoteObjectiveSchema.optional(),
  items: z.array(addQuoteItemRequestSchema).min(1),
});

export const geometryMetricsSchema = z.object({
  volumeCm3: z.number().positive(),
  surfaceAreaCm2: z.number().positive(),
  bboxMm: z.object({
    x: z.number().positive(),
    y: z.number().positive(),
    z: z.number().positive(),
  }),
  lengthCutMm: z.number().positive().optional(),
  holesCount: z.number().int().nonnegative().optional(),
  overhangArea: z.number().nonnegative().optional(),
});

export const dfmIssueSchema = z.object({
  type: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  description: z.string(),
  location: z.string().optional(),
});

export type CreateQuoteRequest = z.infer<typeof createQuoteRequestSchema>;
export type FileUploadRequest = z.infer<typeof fileUploadRequestSchema>;
export type AddQuoteItemRequest = z.infer<typeof addQuoteItemRequestSchema>;
export type CalculateQuoteRequest = z.infer<typeof calculateQuoteRequestSchema>;