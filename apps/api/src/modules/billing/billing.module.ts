import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { UsageTrackingService } from './services/usage-tracking.service';
import { MeteringService } from './services/metering.service';
import { InvoiceService } from './services/invoice.service';
import { PricingTierService } from './services/pricing-tier.service';
import { UsageTrackingInterceptor } from './interceptors/usage-tracking.interceptor';
import { PrismaModule } from '@/prisma/prisma.module';
import { RedisModule } from '@/modules/redis/redis.module';
import { PaymentModule } from '@/modules/payment/payment.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    PaymentModule,
    BullModule.registerQueue({
      name: 'billing',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
  ],
  controllers: [BillingController],
  providers: [
    BillingService,
    UsageTrackingService,
    MeteringService,
    InvoiceService,
    PricingTierService,
    UsageTrackingInterceptor,
  ],
  exports: [BillingService, UsageTrackingService, MeteringService, UsageTrackingInterceptor],
})
export class BillingModule {}
