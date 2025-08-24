import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import configuration from './config/configuration';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { TenantContextMiddleware } from './modules/tenant/tenant-context.middleware';
import { AuditModule } from './modules/audit/audit.module';
import { LoggerModule } from './common/logger/logger.module';
import { RedisModule } from './modules/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { FilesModule } from './modules/files/files.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { PaymentModule } from './modules/payment/payment.module';
import { OrdersModule } from './modules/orders/orders.module';
import { GuestModule } from './modules/guest/guest.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TenantModule,
    PrismaModule,
    LoggerModule,
    RedisModule,
    AuditModule,
    AuthModule,
    UsersModule,
    QuotesModule,
    FilesModule,
    PricingModule,
    AdminModule,
    HealthModule,
    JobsModule,
    PaymentModule,
    OrdersModule,
    GuestModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}
