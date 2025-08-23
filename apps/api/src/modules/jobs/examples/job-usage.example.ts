/**
 * Example usage of the job queue system in controllers and services
 */

import { Injectable, Controller, Post, Body, Get, Param } from '@nestjs/common';
import { JobsService } from '../jobs.service';
import { JobType } from '../interfaces/job.interface';

/**
 * Example 1: Using jobs in a quote controller
 */
@Controller('quotes')
export class QuoteControllerExample {
  constructor(private readonly jobsService: JobsService) {}

  @Post(':quoteId/analyze-files')
  async analyzeQuoteFiles(
    @Param('quoteId') _quoteId: string,
    @Body()
    body: { files: Array<{ fileId: string; fileUrl: string; fileName: string; fileType: string }> },
  ) {
    const jobs = [];

    // Queue file analysis jobs for each file
    for (const file of body.files) {
      const job = await this.jobsService.addJob(
        JobType.FILE_ANALYSIS,
        {
          tenantId: 'tenant-123', // Get from context
          fileId: file.fileId,
          fileUrl: file.fileUrl,
          fileName: file.fileName,
          fileType: file.fileType,
          analysisOptions: {
            performDfm: true,
            extractGeometry: true,
            calculateVolume: true,
            detectFeatures: true,
          },
        },
        {
          priority: 1, // Higher priority
          attempts: 3,
        },
      );

      jobs.push({
        jobId: job.id,
        fileId: file.fileId,
      });
    }

    return {
      message: 'File analysis jobs queued',
      jobs,
    };
  }

  @Post(':quoteId/calculate')
  async calculateQuote(@Param('quoteId') quoteId: string, @Body() body: { rushOrder?: boolean }) {
    // Queue quote calculation job
    const job = await this.jobsService.addJob(
      JobType.QUOTE_CALCULATION,
      {
        tenantId: 'tenant-123', // Get from context
        quoteId,
        items: [
          {
            fileId: 'file-123',
            quantity: 10,
            material: 'ABS',
            process: 'FFF',
            finishOptions: {
              color: 'black',
              finish: 'standard',
            },
          },
        ],
        rushOrder: body.rushOrder,
        currency: 'MXN',
      },
      {
        delay: 5000, // Wait 5 seconds before processing
      },
    );

    return {
      message: 'Quote calculation job queued',
      jobId: job.id,
      status: await job.getState(),
    };
  }
}

/**
 * Example 2: Using jobs in a service for notifications
 */
@Injectable()
export class NotificationServiceExample {
  constructor(private readonly jobsService: JobsService) {}

  async sendQuoteReadyNotification(
    quoteId: string,
    customerEmail: string,
    customerName: string,
    quoteData: any,
  ) {
    // Queue email notification job
    const job = await this.jobsService.addJob(
      JobType.EMAIL_NOTIFICATION,
      {
        tenantId: 'tenant-123',
        type: 'quote-ready',
        recipientEmail: customerEmail,
        recipientName: customerName,
        templateData: {
          quoteNumber: quoteData.number,
          itemCount: quoteData.items.length,
          currency: quoteData.currency,
          total: quoteData.total,
          validUntil: quoteData.validUntil,
          quoteUrl: `https://app.madfam.com/quotes/${quoteId}`,
        },
      },
      {
        attempts: 5, // More attempts for email
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    );

    return job.id;
  }

  async scheduleQuoteExpiryNotification(quoteId: string, customerEmail: string, expiryDate: Date) {
    const delay = expiryDate.getTime() - Date.now();

    // Schedule job for future execution
    const job = await this.jobsService.scheduleJob(
      JobType.EMAIL_NOTIFICATION,
      {
        tenantId: 'tenant-123',
        type: 'quote-expired',
        recipientEmail: customerEmail,
        templateData: {
          quoteNumber: `Q-${quoteId}`,
          expirationDate: expiryDate.toLocaleDateString(),
          newQuoteUrl: 'https://app.madfam.com/quotes/new',
        },
      },
      delay,
    );

    return job.id;
  }
}

/**
 * Example 3: Using jobs for report generation
 */
@Injectable()
export class ReportServiceExample {
  constructor(private readonly jobsService: JobsService) {}

  async generateQuoteReport(quoteId: string, format: 'pdf' | 'excel') {
    const job = await this.jobsService.addJob(JobType.REPORT_GENERATION, {
      tenantId: 'tenant-123',
      reportType: 'quote',
      entityId: quoteId,
      format,
      options: {
        includeItemDetails: true,
        includeTerms: true,
        includeTechnicalSpecs: true,
        language: 'es',
      },
    });

    return {
      jobId: job.id,
      message: 'Report generation started',
    };
  }

  async generateMonthlyAnalytics(month: string, year: number) {
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0);

    const job = await this.jobsService.addJob(
      JobType.REPORT_GENERATION,
      {
        tenantId: 'tenant-123',
        reportType: 'analytics',
        entityId: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy: 'day',
        }),
        format: 'excel',
        options: {
          language: 'en',
        },
      },
      {
        priority: 0, // Lower priority for analytics
      },
    );

    return job.id;
  }
}

/**
 * Example 4: Monitoring job progress
 */
@Controller('jobs')
export class JobMonitoringExample {
  constructor(private readonly jobsService: JobsService) {}

  @Get(':jobId/status')
  async getJobStatus(@Param('jobId') jobId: string) {
    const status = await this.jobsService.getJobStatus(jobId);

    if (!status) {
      throw new Error('Job not found');
    }

    return {
      jobId: status.jobId,
      type: status.type,
      status: status.status,
      progress: status.progress,
      createdAt: status.createdAt,
      completedAt: status.completedAt,
      error: status.error,
      result: status.result,
    };
  }

  @Get('queue/:type/metrics')
  async getQueueMetrics(@Param('type') type: JobType) {
    const metrics = await this.jobsService.getQueueMetrics(type);

    return metrics;
  }
}

/**
 * Example 5: Setting up recurring jobs
 */
@Injectable()
export class RecurringJobsExample {
  constructor(private readonly jobsService: JobsService) {}

  async setupDailyReports(tenantId: string) {
    // Generate daily analytics report at 2 AM
    await this.jobsService.addRecurringJob(
      JobType.REPORT_GENERATION,
      {
        tenantId,
        reportType: 'analytics',
        entityId: JSON.stringify({
          period: 'daily',
          autoSend: true,
        }),
        format: 'pdf',
      },
      '0 2 * * *', // Cron expression for 2 AM daily
    );
  }

  async setupQuoteExpiryCheck(tenantId: string) {
    // Check for expiring quotes every day at 9 AM
    await this.jobsService.addRecurringJob(
      JobType.EMAIL_NOTIFICATION,
      {
        tenantId,
        type: 'quote-expired',
        recipientEmail: 'admin@company.com',
        templateData: {
          checkType: 'daily-expiry-check',
        },
      },
      '0 9 * * *', // Cron expression for 9 AM daily
    );
  }
}

/**
 * Example 6: Error handling and retry
 */
@Injectable()
export class JobErrorHandlingExample {
  constructor(private readonly jobsService: JobsService) {}

  async handleFailedJob(jobId: string) {
    const job = await this.jobsService.getJob(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    const state = await job.getState();

    if (state === 'failed') {
      const failedReason = job.failedReason;

      // Check if it's a recoverable error
      if (this.isRecoverableError(failedReason)) {
        // Retry the job
        await this.jobsService.retryJob(jobId);
      } else {
        // Move to dead letter queue for manual inspection
        await this.jobsService.moveToDeadLetter(jobId, 'Non-recoverable error: ' + failedReason);
      }
    }
  }

  private isRecoverableError(error: string): boolean {
    const recoverableErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'Network error'];

    return recoverableErrors.some((e) => error.includes(e));
  }
}
