import { z } from 'zod';

const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('4000'),

  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),

  // Redis
  REDIS_URL: z.string().url().startsWith('redis://'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3002'),

  // AWS S3
  AWS_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  KMS_KEY_ID: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  // Currency
  DEFAULT_CURRENCY: z.enum(['MXN', 'USD', 'EUR']).default('MXN'),
  SUPPORTED_CURRENCIES: z.string().default('MXN,USD'),
  FX_SOURCE: z.enum(['openexchangerates', 'fixer', 'static']).default('openexchangerates'),
  OPENEXCHANGERATES_API_KEY: z.string().optional(),

  // Localization
  DEFAULT_LOCALES: z.string().default('es,en'),
  DEFAULT_LOCALE: z.enum(['es', 'en']).default('es'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),

  // Worker Service
  WORKER_SERVICE_URL: z.string().url().default('http://localhost:8000'),

  // Rate Limiting
  RATE_LIMIT_TTL: z.string().transform(Number).default('60'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),

  // Feature Flags
  ENABLE_SUPPLIER_PORTAL: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  ENABLE_SUSTAINABILITY_SCORING: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),
  ENABLE_NDA_TRACKING: z
    .string()
    .transform((v) => v === 'true')
    .default('true'),

  // Quote Settings
  QUOTE_VALIDITY_DAYS: z.string().transform(Number).default('14'),
  MIN_ORDER_VALUE_MXN: z.string().transform(Number).default('500'),
  MAX_FILE_SIZE_MB: z.string().transform(Number).default('100'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  try {
    return envSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter((err) => err.message === 'Required')
        .map((err) => err.path.join('.'));

      const invalidVars = error.errors
        .filter((err) => err.message !== 'Required')
        .map((err) => `${err.path.join('.')}: ${err.message}`);

      let message = 'Environment validation failed:\n';

      if (missingVars.length > 0) {
        message += `\nMissing required variables:\n${missingVars.map((v) => `  - ${v}`).join('\n')}`;
      }

      if (invalidVars.length > 0) {
        message += `\n\nInvalid variables:\n${invalidVars.map((v) => `  - ${v}`).join('\n')}`;
      }

      throw new Error(message);
    }
    throw error;
  }
}
