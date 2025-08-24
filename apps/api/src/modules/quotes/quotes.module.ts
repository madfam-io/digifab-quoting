import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { FilesModule } from '../files/files.module';
import { PricingModule } from '../pricing/pricing.module';
import { PaymentModule } from '../payment/payment.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [FilesModule, PricingModule, PaymentModule, TenantsModule],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
