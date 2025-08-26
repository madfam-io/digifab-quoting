import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { I18nModule } from '../i18n/i18n.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [I18nModule, PrismaModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}