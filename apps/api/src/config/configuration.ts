export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    s3: {
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION || process.env.AWS_REGION,
    },
    kms: {
      keyId: process.env.KMS_KEY_ID,
    },
    sqs: {
      queueUrl: process.env.SQS_QUEUE_URL,
    },
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  email: {
    from: process.env.EMAIL_FROM || 'noreply@madfam.app',
    sesRegion: process.env.SES_REGION || process.env.AWS_REGION,
  },
  defaults: {
    currency: process.env.DEFAULT_CURRENCY || 'MXN',
    locale: process.env.DEFAULT_LOCALE || 'es',
    quoteValidityDays: parseInt(process.env.QUOTE_VALIDITY_DAYS, 10) || 14,
  },
  fx: {
    provider: process.env.FX_PROVIDER || 'openexchangerates',
    apiKey: process.env.FX_API_KEY,
  },
  worker: {
    geometryServiceUrl: process.env.GEOMETRY_SERVICE_URL || 'http://localhost:8000',
  },
});