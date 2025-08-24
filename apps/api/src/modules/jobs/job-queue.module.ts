import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QuoteCalculationProcessor } from './processors/quote-calculation.processor';
import { FileAnalysisProcessor } from './processors/file-analysis.processor';
import { EmailNotificationProcessor } from './processors/email-notification.processor';
import { JobQueueService } from './job-queue.service';
import { JobMonitoringService } from './job-monitoring.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          retryStrategy: (times: number) => {
            return Math.min(times * 50, 2000);
          },
        },
        defaultJobOptions: {
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 1000, // Keep last 1000 failed jobs
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: 'quote-calculation',
        defaultJobOptions: {
          priority: 1,
          timeout: 60000, // 1 minute timeout
        },
      },
      {
        name: 'file-analysis',
        defaultJobOptions: {
          priority: 2,
          timeout: 120000, // 2 minute timeout
        },
      },
      {
        name: 'email-notification',
        defaultJobOptions: {
          priority: 3,
          timeout: 30000, // 30 second timeout
        },
      },
    ),
  ],
  providers: [
    QuoteCalculationProcessor,
    FileAnalysisProcessor,
    EmailNotificationProcessor,
    JobQueueService,
    JobMonitoringService,
  ],
  exports: [JobQueueService, JobMonitoringService],
})
export class JobQueueModule {}