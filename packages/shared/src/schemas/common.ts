import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const iso8601Schema = z.string().datetime();
export const currencySchema = z.enum(['MXN', 'USD']);
export const localeSchema = z.enum(['es', 'en']);
export const userRoleSchema = z.enum(['admin', 'manager', 'operator', 'support', 'customer']);

export const timestampedSchema = z.object({
  createdAt: iso8601Schema,
  updatedAt: iso8601Schema,
});

export const tenantScopedSchema = z.object({
  tenantId: uuidSchema,
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.any()).optional(),
      })
      .optional(),
    meta: z
      .object({
        timestamp: iso8601Schema,
        version: z.string(),
      })
      .optional(),
  });

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
