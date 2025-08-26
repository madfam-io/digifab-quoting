import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JobType } from './interfaces/job.interface';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { FileAnalysisProcessor } from './processors/file-analysis.processor';
import { QuoteCalculationProcessor } from './processors/quote-calculation.processor';
import { EmailNotificationProcessor } from './processors/email-notification.processor';
import { ReportGenerationProcessor } from './processors/report-generation.processor';
import { LinkAnalysisProcessor } from './processors/link-analysis.processor';
import { RedisModule } from '@/modules/redis/redis.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { TenantModule } from '@/modules/tenant/tenant.module';
import { LoggerModule } from '@/common/logger/logger.module';
import { FilesModule } from '@/modules/files/files.module';
import { QuotesModule } from '@/modules/quotes/quotes.module';
import { PricingModule } from '@/modules/pricing/pricing.module';

// Import report generation services
import { ReportDataLoaderService } from './services/report-data-loader.service';
import { PdfReportGeneratorService } from './services/pdf-report-generator.service';
import { ExcelReportGeneratorService } from './services/excel-report-generator.service';
import { CsvReportGeneratorService } from './services/csv-report-generator.service';
import { ReportUploaderService } from './services/report-uploader.service';

// Import link processing services  
import { ContentFetcherService } from '../link-processing/services/content-fetcher.service';
import { BOMParserService } from '../link-processing/services/bom-parser.service';
import { PersonaQuoteGeneratorService } from '../link-processing/services/persona-quote-generator.service';

@Module({
  imports: [
    ConfigModule,
    // Register Bull queues
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: configService.get('redis.url'),
        defaultJobOptions: {
          removeOnComplete: {
            age: 24 * 3600, // 24 hours
            count: 100, // Keep last 100 completed jobs
          },
          removeOnFail: {
            age: 7 * 24 * 3600, // 7 days
            count: 1000, // Keep last 1000 failed jobs
          },
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      }),
      inject: [ConfigService],
    }),
    // Register individual queues
    BullModule.registerQueue(
      {
        name: JobType.FILE_ANALYSIS,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          timeout: 5 * 60 * 1000, // 5 minutes
        },
      },
      {
        name: JobType.QUOTE_CALCULATION,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          timeout: 2 * 60 * 1000, // 2 minutes
        },
      },
      {
        name: JobType.EMAIL_NOTIFICATION,
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 10000,
          },
          timeout: 30 * 1000, // 30 seconds
        },
      },
      {
        name: JobType.REPORT_GENERATION,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          timeout: 3 * 60 * 1000, // 3 minutes
        },
      },
      {
        name: JobType.LINK_ANALYSIS,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          timeout: 5 * 60 * 1000, // 5 minutes
        },
      },
    ),
    // Dead letter queue
    BullModule.registerQueue({
      name: 'dead-letter-queue',
      defaultJobOptions: {
        removeOnComplete: false,
        removeOnFail: false,
      },
    }),
    RedisModule,
    PrismaModule,
    TenantModule,
    LoggerModule,
    HttpModule,
    FilesModule,
    QuotesModule,
    PricingModule,
  ],
  controllers: [JobsController],
  providers: [
    JobsService,
    FileAnalysisProcessor,
    QuoteCalculationProcessor,
    EmailNotificationProcessor,
    ReportGenerationProcessor,
    LinkAnalysisProcessor,
    // Report generation services
    ReportDataLoaderService,
    PdfReportGeneratorService,
    ExcelReportGeneratorService,
    CsvReportGeneratorService,
    ReportUploaderService,
    // Link processing services
    ContentFetcherService,
    BOMParserService,
    PersonaQuoteGeneratorService,
  ],
  exports: [JobsService],
})
export class JobsModule {}
