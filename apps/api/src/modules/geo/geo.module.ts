import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';
import { CurrencyService } from './currency.service';
import { RedisModule } from '@/modules/redis/redis.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    RedisModule,
    PrismaModule,
  ],
  controllers: [GeoController],
  providers: [GeoService, CurrencyService],
  exports: [GeoService, CurrencyService],
})
export class GeoModule {}