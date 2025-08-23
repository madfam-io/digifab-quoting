import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { TenantModule } from '../../modules/tenant/tenant.module';

@Global()
@Module({
  imports: [TenantModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
