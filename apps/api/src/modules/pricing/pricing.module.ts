import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { ForgeSightService } from './forgesight.service';

@Module({
  controllers: [PricingController],
  providers: [PricingService, ForgeSightService],
  exports: [PricingService, ForgeSightService],
})
export class PricingModule {}
