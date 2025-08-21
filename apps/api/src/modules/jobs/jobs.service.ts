import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job, JobStatus as BullJobStatus, JobStatusClean } from 'bull';
import { 
  JobType, 
  JobData, 
  JobOptions, 
  JobMetrics, 
  QueueMetrics,
  JobStatus,
  FileAnalysisJobData,
  QuoteCalculationJobData,
  EmailNotificationJobData,
  ReportGenerationJobData,
} from './interfaces/job.interface';
import { LoggerService } from '@/common/logger/logger.service';
import { RedisService } from '@/modules/redis/redis.service';
import { TenantContextService } from '@/modules/tenant/tenant-context.service';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly queues = new Map<JobType, Queue>();
  private readonly DEFAULT_JOB_OPTIONS: JobOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  };

  constructor(
    @InjectQueue(JobType.FILE_ANALYSIS) private readonly fileAnalysisQueue: Queue,
    @InjectQueue(JobType.QUOTE_CALCULATION) private readonly quoteCalculationQueue: Queue,
    @InjectQueue(JobType.EMAIL_NOTIFICATION) private readonly emailNotificationQueue: Queue,
    @InjectQueue(JobType.REPORT_GENERATION) private readonly reportGenerationQueue: Queue,
    @InjectQueue('dead-letter-queue') private readonly deadLetterQueue: Queue,
    private readonly logger: LoggerService,
    private readonly redisService: RedisService,
    private readonly tenantContext: TenantContextService,
  ) {
    // Initialize queue map
    this.queues.set(JobType.FILE_ANALYSIS, fileAnalysisQueue);
    this.queues.set(JobType.QUOTE_CALCULATION, quoteCalculationQueue);
    this.queues.set(JobType.EMAIL_NOTIFICATION, emailNotificationQueue);
    this.queues.set(JobType.REPORT_GENERATION, reportGenerationQueue);
  }

  async onModuleInit() {
    // Set up queue event listeners
    for (const [type, queue] of this.queues) {
      this.setupQueueListeners(type, queue);
    }
    
    // Set up dead letter queue processing
    this.setupDeadLetterQueue();
  }

  /**
   * Add a job to the appropriate queue
   */
  async addJob<T extends JobData>(
    type: JobType,
    data: T,
    options?: JobOptions,
  ): Promise<Job<T>> {
    const queue = this.queues.get(type);
    if (!queue) {
      throw new Error(`Queue for job type ${type} not found`);
    }

    // Ensure tenant context is included
    const tenantId = data.tenantId || this.tenantContext.getTenantId();
    if (!tenantId) {
      throw new Error('Tenant ID is required for job processing');
    }

    const jobData = {
      ...data,
      tenantId,
      correlationId: data.correlationId || this.generateCorrelationId(),
    };

    const jobOptions = {
      ...this.DEFAULT_JOB_OPTIONS,
      ...options,
    };

    const job = await queue.add(type, jobData, jobOptions);
    
    this.logger.log(`Job ${job.id} of type ${type} added to queue`, {
      jobId: job.id,
      type,
      tenantId,
      correlationId: jobData.correlationId,
    });

    // Track job in Redis for quick lookups
    await this.trackJob(job.id as string, type, tenantId);

    return job;
  }

  /**
   * Schedule a job for future execution
   */
  async scheduleJob<T extends JobData>(
    type: JobType,
    data: T,
    delay: number,
    options?: JobOptions,
  ): Promise<Job<T>> {
    return this.addJob(type, data, {
      ...options,
      delay,
    });
  }

  /**
   * Add a recurring job (cron job)
   */
  async addRecurringJob<T extends JobData>(
    type: JobType,
    data: T,
    cronExpression: string,
    options?: JobOptions,
  ): Promise<void> {
    const queue = this.queues.get(type);
    if (!queue) {
      throw new Error(`Queue for job type ${type} not found`);
    }

    const jobName = `${type}-recurring-${data.tenantId}`;
    
    await queue.add(
      jobName,
      data,
      {
        ...this.DEFAULT_JOB_OPTIONS,
        ...options,
        repeat: {
          cron: cronExpression,
        },
      },
    );

    this.logger.log(`Recurring job ${jobName} scheduled with cron: ${cronExpression}`);
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<Job | null> {
    // Try to get job type from Redis tracking
    const jobInfo = await this.getJobInfo(jobId);
    if (!jobInfo) {
      // If not found, search all queues
      for (const queue of this.queues.values()) {
        const job = await queue.getJob(jobId);
        if (job) return job;
      }
      return null;
    }

    const queue = this.queues.get(jobInfo.type);
    return queue ? queue.getJob(jobId) : null;
  }

  /**
   * Get job status and progress
   */
  async getJobStatus(jobId: string): Promise<JobMetrics | null> {
    const job = await this.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    const progress = job.progress();

    return {
      jobId: job.id as string,
      type: job.name as JobType,
      status: this.mapBullStatus(state),
      createdAt: new Date(job.timestamp),
      startedAt: job.processedOn ? new Date(job.processedOn) : undefined,
      completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
      progress: typeof progress === 'number' ? progress : 0,
      attempts: job.attemptsMade,
      error: job.failedReason,
      result: job.returnvalue,
      duration: job.finishedOn && job.processedOn 
        ? job.finishedOn - job.processedOn 
        : undefined,
    };
  }

  /**
   * Update job progress
   */
  async updateJobProgress(
    jobId: string,
    progress: number,
    message?: string,
  ): Promise<void> {
    const job = await this.getJob(jobId);
    if (job) {
      await job.progress(progress);
      if (message) {
        await job.log(message);
      }
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.getJob(jobId);
    if (!job) return false;

    const state = await job.getState();
    if (state === 'active') {
      // Can't cancel active jobs, but we can mark them for cancellation
      await job.update({ cancelled: true });
      this.logger.warn(`Job ${jobId} marked for cancellation`);
      return true;
    }

    await job.remove();
    this.logger.log(`Job ${jobId} cancelled and removed`);
    return true;
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<Job | null> {
    const job = await this.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    if (state !== 'failed') {
      throw new Error(`Job ${jobId} is not in failed state`);
    }

    await job.retry();
    this.logger.log(`Job ${jobId} retried`);
    return job;
  }

  /**
   * Move failed job to dead letter queue
   */
  async moveToDeadLetter(jobId: string, reason: string): Promise<void> {
    const job = await this.getJob(jobId);
    if (!job) return;

    await this.deadLetterQueue.add('dead-letter', {
      originalJob: {
        id: job.id,
        name: job.name,
        data: job.data,
        opts: job.opts,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        attemptsMade: job.attemptsMade,
      },
      reason,
      movedAt: new Date(),
    });

    await job.remove();
    this.logger.warn(`Job ${jobId} moved to dead letter queue: ${reason}`);
  }

  /**
   * Get queue metrics
   */
  async getQueueMetrics(type?: JobType): Promise<QueueMetrics | QueueMetrics[]> {
    if (type) {
      const queue = this.queues.get(type);
      if (!queue) throw new Error(`Queue ${type} not found`);
      return this.getMetricsForQueue(type, queue);
    }

    const metrics: QueueMetrics[] = [];
    for (const [type, queue] of this.queues) {
      metrics.push(await this.getMetricsForQueue(type, queue));
    }
    return metrics;
  }

  /**
   * Clean old jobs from queues
   */
  async cleanOldJobs(
    type: JobType,
    grace: number,
    status?: JobStatusClean[],
  ): Promise<string[]> {
    const queue = this.queues.get(type);
    if (!queue) throw new Error(`Queue ${type} not found`);

    const statuses = status || ['completed', 'failed'];
    const removed: string[] = [];

    for (const s of statuses) {
      const jobs = await queue.clean(grace, s);
      removed.push(...jobs);
    }

    this.logger.log(`Cleaned ${removed.length} jobs from ${type} queue`);
    return removed;
  }

  /**
   * Pause/resume queue processing
   */
  async pauseQueue(type: JobType): Promise<void> {
    const queue = this.queues.get(type);
    if (!queue) throw new Error(`Queue ${type} not found`);
    
    await queue.pause();
    this.logger.log(`Queue ${type} paused`);
  }

  async resumeQueue(type: JobType): Promise<void> {
    const queue = this.queues.get(type);
    if (!queue) throw new Error(`Queue ${type} not found`);
    
    await queue.resume();
    this.logger.log(`Queue ${type} resumed`);
  }

  /**
   * Get jobs by tenant
   */
  async getJobsByTenant(
    tenantId: string,
    options?: {
      type?: JobType;
      status?: JobStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<JobMetrics[]> {
    const jobs: JobMetrics[] = [];
    const queues = options?.type 
      ? [this.queues.get(options.type)].filter(Boolean)
      : Array.from(this.queues.values());

    for (const queue of queues) {
      if (!queue) continue;

      // Get jobs from different states
      const states: BullJobStatus[] = options?.status
        ? [this.mapToBullStatus(options.status)]
        : ['waiting', 'active', 'completed', 'failed', 'delayed', 'paused'];

      for (const state of states) {
        const queueJobs = await queue.getJobs([state], 0, -1);
        
        for (const job of queueJobs) {
          if (job.data.tenantId === tenantId) {
            const metrics = await this.getJobStatus(job.id as string);
            if (metrics) jobs.push(metrics);
          }
        }
      }
    }

    // Apply pagination
    const start = options?.offset || 0;
    const limit = options?.limit || 100;
    return jobs.slice(start, start + limit);
  }

  private setupQueueListeners(type: JobType, queue: Queue): void {
    queue.on('completed', (job, result) => {
      this.logger.log(`Job ${job.id} of type ${type} completed`, {
        jobId: job.id,
        type,
        duration: job.finishedOn && job.processedOn 
          ? job.finishedOn - job.processedOn 
          : undefined,
      });
    });

    queue.on('failed', (job, err) => {
      this.logger.error(`Job ${job.id} of type ${type} failed`, err, {
        jobId: job.id,
        type,
        attempts: job.attemptsMade,
      });

      // Move to dead letter queue after max attempts
      if (job.attemptsMade >= (job.opts.attempts || this.DEFAULT_JOB_OPTIONS.attempts!)) {
        this.moveToDeadLetter(job.id as string, 'Max attempts reached');
      }
    });

    queue.on('stalled', (job) => {
      this.logger.warn(`Job ${job.id} of type ${type} stalled`, {
        jobId: job.id,
        type,
      });
    });

    queue.on('error', (error) => {
      this.logger.error(`Queue ${type} error`, error);
    });
  }

  private setupDeadLetterQueue(): void {
    // Process dead letter queue periodically
    setInterval(async () => {
      const jobs = await this.deadLetterQueue.getJobs(['waiting'], 0, 10);
      
      for (const job of jobs) {
        this.logger.warn('Dead letter job found', {
          originalJobId: job.data.originalJob.id,
          reason: job.data.reason,
        });
        
        // You can implement custom logic here to handle dead letter jobs
        // For example, send alerts, store in database, etc.
      }
    }, 60000); // Check every minute
  }

  private async trackJob(
    jobId: string,
    type: JobType,
    tenantId: string,
  ): Promise<void> {
    const key = this.redisService.generateKey({
      prefix: 'job-tracking',
      identifier: jobId,
    });

    await this.redisService.set(
      key,
      { type, tenantId },
      3600 * 24 * 7, // Keep for 7 days
    );
  }

  private async getJobInfo(
    jobId: string,
  ): Promise<{ type: JobType; tenantId: string } | null> {
    const key = this.redisService.generateKey({
      prefix: 'job-tracking',
      identifier: jobId,
    });

    return this.redisService.get(key);
  }

  private async getMetricsForQueue(
    type: JobType,
    queue: Queue,
  ): Promise<QueueMetrics> {
    const [
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
    ] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.isPaused(),
    ]);

    // Calculate rates
    const total = completed + failed;
    const completedRate = total > 0 ? (completed / total) * 100 : 0;
    const failedRate = total > 0 ? (failed / total) * 100 : 0;

    // Get average processing time from recent jobs
    const recentJobs = await queue.getJobs(['completed'], 0, 100);
    let totalTime = 0;
    let count = 0;

    for (const job of recentJobs) {
      if (job.finishedOn && job.processedOn) {
        totalTime += job.finishedOn - job.processedOn;
        count++;
      }
    }

    const avgProcessingTime = count > 0 ? totalTime / count : 0;

    return {
      name: type,
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
      completedRate,
      failedRate,
      avgProcessingTime,
    };
  }

  private mapBullStatus(status: BullJobStatus): JobStatus {
    const statusMap: Record<BullJobStatus, JobStatus> = {
      waiting: JobStatus.PENDING,
      active: JobStatus.PROCESSING,
      completed: JobStatus.COMPLETED,
      failed: JobStatus.FAILED,
      delayed: JobStatus.DELAYED,
      paused: JobStatus.PENDING,
    };

    return statusMap[status] || JobStatus.PENDING;
  }

  private mapToBullStatus(status: JobStatus): BullJobStatus {
    const statusMap: Record<JobStatus, BullJobStatus> = {
      [JobStatus.PENDING]: 'waiting',
      [JobStatus.PROCESSING]: 'active',
      [JobStatus.COMPLETED]: 'completed',
      [JobStatus.FAILED]: 'failed',
      [JobStatus.DELAYED]: 'delayed',
      [JobStatus.STALLED]: 'failed',
    };

    return statusMap[status] || 'waiting';
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}