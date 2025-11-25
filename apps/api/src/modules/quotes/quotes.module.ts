import { Module, forwardRef } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { FilesModule } from '../files/files.module';
import { PricingModule } from '../pricing/pricing.module';
import { PaymentModule } from '../payment/payment.module';
import { TenantsModule } from '../tenants/tenants.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [FilesModule, PricingModule, PaymentModule, TenantsModule, forwardRef(() => JobsModule)],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
