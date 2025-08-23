import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CacheService } from './cache.service';
import { QuoteCacheService } from './quote-cache.service';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { CacheController } from './cache.controller';
import { TenantModule } from '@/modules/tenant/tenant.module';
import { LoggerModule } from '@/common/logger/logger.module';

@Global()
@Module({
  imports: [TenantModule, LoggerModule],
  controllers: [CacheController],
  providers: [RedisService, CacheService, QuoteCacheService, CacheInterceptor],
  exports: [RedisService, CacheService, QuoteCacheService, CacheInterceptor],
})
export class RedisModule {}
