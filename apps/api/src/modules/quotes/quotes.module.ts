import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { FilesModule } from '../files/files.module';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [FilesModule, PricingModule],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}