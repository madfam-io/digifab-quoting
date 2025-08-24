import { z } from 'zod';
import { QuoteStatus, ProcessType } from '@madfam/shared';

// Quote objective validation
export const QuoteObjectiveSchema = z
  .object({
    cost: z.number().min(0).max(1),
    lead: z.number().min(0).max(1),
    green: z.number().min(0).max(1),
  })
  .refine((data) => Math.abs(data.cost + data.lead + data.green - 1) < 0.001, {
    message: 'Objective weights must sum to 1',
  });

// Quote filters validation
export const QuoteFiltersSchema = z.object({
  status: z.nativeEnum(QuoteStatus).optional(),
  customerId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().min(1).max(100).optional(),
});

// Quote item selections validation based on process
const BaseSelectionsSchema = z.object({
  material: z.string(),
  quantity: z.number().int().min(1),
});

const FFFSelectionsSchema = BaseSelectionsSchema.extend({
  layerHeight: z.number().min(0.05).max(0.5),
  infill: z.number().int().min(0).max(100),
  supportsRequired: z.boolean().optional(),
  color: z.string().optional(),
});

const SLASelectionsSchema = BaseSelectionsSchema.extend({
  layerHeight: z.number().min(0.025).max(0.3),
  supportsRequired: z.boolean().optional(),
  biocompatible: z.boolean().optional(),
});

const CNCSelectionsSchema = BaseSelectionsSchema.extend({
  tolerance: z.enum(['loose', 'standard', 'tight', 'precision']),
  surfaceFinish: z.enum(['as-machined', 'smooth', 'polished']),
});

const LaserSelectionsSchema = BaseSelectionsSchema.extend({
  thickness: z.number().min(0.1).max(50),
});

export const QuoteItemSelectionsSchema = z.discriminatedUnion('process', [
  z.object({ process: z.literal(ProcessType.FFF), selections: FFFSelectionsSchema }),
  z.object({ process: z.literal(ProcessType.SLA), selections: SLASelectionsSchema }),
  z.object({ process: z.literal(ProcessType.CNC_3AXIS), selections: CNCSelectionsSchema }),
  z.object({ process: z.literal(ProcessType.LASER_2D), selections: LaserSelectionsSchema }),
]);

// Create quote item validation
export const CreateQuoteItemSchema = z.object({
  fileId: z.string().uuid(),
  process: z.nativeEnum(ProcessType),
  material: z.string(),
  quantity: z.number().int().min(1).max(10000),
  selections: z.record(z.any()), // Will be validated based on process
  notes: z.string().max(500).optional(),
});

// Update quote item validation
export const UpdateQuoteItemSchema = z.object({
  itemId: z.string().uuid(),
  material: z.string().optional(),
  quantity: z.number().int().min(1).max(10000).optional(),
  selections: z.record(z.any()).optional(),
});

// Shipping address validation
export const ShippingAddressSchema = z.object({
  line1: z.string().min(1).max(100),
  line2: z.string().max(100).optional(),
  city: z.string().min(1).max(50),
  state: z.string().min(1).max(50),
  postalCode: z.string().min(1).max(20),
  country: z.string().length(2), // ISO country code
});

// Accept quote validation
export const AcceptQuoteSchema = z.object({
  acceptedItems: z.array(z.string().uuid()).min(1),
  shippingAddress: ShippingAddressSchema,
  notes: z.string().max(500).optional(),
});

// Validation helpers
export function validateQuoteObjective(objective: unknown) {
  return QuoteObjectiveSchema.parse(objective);
}

export function validateQuoteFilters(filters: unknown) {
  return QuoteFiltersSchema.parse(filters);
}

export function validateQuoteItemSelections(process: ProcessType, selections: unknown) {
  const schema = QuoteItemSelectionsSchema.parse({ process, selections });
  return schema.selections;
}

export function validateCreateQuoteItem(item: unknown) {
  const parsed = CreateQuoteItemSchema.parse(item);

  // Validate selections based on process
  const validatedSelections = validateQuoteItemSelections(parsed.process, {
    ...(parsed.selections || {}),
    material: parsed.material,
    quantity: parsed.quantity,
  });

  return {
    ...parsed,
    selections: validatedSelections,
  };
}

// Type exports
export type QuoteObjective = z.infer<typeof QuoteObjectiveSchema>;
export type QuoteFilters = z.infer<typeof QuoteFiltersSchema>;
export type CreateQuoteItem = z.infer<typeof CreateQuoteItemSchema>;
export type UpdateQuoteItem = z.infer<typeof UpdateQuoteItemSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type AcceptQuote = z.infer<typeof AcceptQuoteSchema>;
