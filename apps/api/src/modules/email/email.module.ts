import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './email.service';
import { JanuaEmailService } from './janua-email.service';
import { I18nModule } from '../i18n/i18n.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    I18nModule,
    PrismaModule,
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
  ],
  providers: [EmailService, JanuaEmailService],
  exports: [EmailService, JanuaEmailService],
})
export class EmailModule {}
