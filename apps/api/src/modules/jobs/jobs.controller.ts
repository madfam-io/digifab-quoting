import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Param, 
  Query, 
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Tenant } from '@/modules/tenant/decorators/tenant.decorator';
import { 
  JobType, 
  JobStatus,
  JobMetrics,
  QueueMetrics,
} from './interfaces/job.interface';
import { 
  CreateJobDto,
  ScheduleJobDto,
  RecurringJobDto,
  JobQueryDto,
  JobStatusDto,
  QueueStatusDto,
  CleanJobsDto,
} from './dto/job.dto';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiResponse({ 
  status: HttpStatus.UNAUTHORIZED, 
  description: 'Unauthorized - Invalid or missing JWT token' 
})
@ApiResponse({ 
  status: HttpStatus.FORBIDDEN, 
  description: 'Forbidden - Insufficient permissions' 
})
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ 
    summary: 'Create a new job',
    description: 'Create a new background job for asynchronous processing (file analysis, quote calculation, etc.)' 
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Job created successfully',
    schema: {
      properties: {
        jobId: { type: 'string', example: 'job_123456' },
        type: { type: 'string', example: 'file-analysis' },
        status: { type: 'string', example: 'waiting' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid job data' 
  })
  async createJob(
    @Body() createJobDto: CreateJobDto,
    @Tenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    const job = await this.jobsService.addJob(
      createJobDto.type,
      {
        ...createJobDto.data,
        tenantId,
        userId: user.id,
      } as JobData,
      createJobDto.options,
    );

    return {
      jobId: job.id,
      type: job.name,
      status: await job.getState(),
      createdAt: new Date(job.timestamp),
    };
  }

  @Post('schedule')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Schedule a job for future execution' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Job scheduled successfully' 
  })
  async scheduleJob(
    @Body() scheduleJobDto: ScheduleJobDto,
    @Tenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    const job = await this.jobsService.scheduleJob(
      scheduleJobDto.type,
      {
        ...scheduleJobDto.data,
        tenantId,
        userId: user.id,
      } as JobData,
      scheduleJobDto.delay,
      scheduleJobDto.options,
    );

    return {
      jobId: job.id,
      type: job.name,
      status: await job.getState(),
      scheduledFor: new Date(Date.now() + scheduleJobDto.delay),
    };
  }

  @Post('recurring')
  @Roles('admin')
  @ApiOperation({ summary: 'Create a recurring job' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Recurring job created successfully' 
  })
  async createRecurringJob(
    @Body() recurringJobDto: RecurringJobDto,
    @Tenant() tenantId: string,
    @CurrentUser() user: any,
  ) {
    await this.jobsService.addRecurringJob(
      recurringJobDto.type,
      {
        ...recurringJobDto.data,
        tenantId,
        userId: user.id,
      } as JobData,
      recurringJobDto.cronExpression,
      recurringJobDto.options,
    );

    return {
      message: 'Recurring job created successfully',
      type: recurringJobDto.type,
      cron: recurringJobDto.cronExpression,
    };
  }

  @Get(':jobId')
  @ApiOperation({ 
    summary: 'Get job status by ID',
    description: 'Retrieve detailed status and progress information for a specific job' 
  })
  @ApiParam({ 
    name: 'jobId', 
    description: 'Unique job identifier',
    example: 'job_123456' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Job status retrieved',
    type: JobStatusDto,
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Job not found' 
  })
  async getJobStatus(@Param('jobId') jobId: string): Promise<JobStatusDto> {
    const status = await this.jobsService.getJobStatus(jobId);
    if (!status) {
      throw new Error('Job not found');
    }
    return status;
  }

  @Get()
  @ApiOperation({ summary: 'Get jobs by tenant' })
  @ApiQuery({ name: 'type', enum: JobType, required: false })
  @ApiQuery({ name: 'status', enum: JobStatus, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false, default: 100 })
  @ApiQuery({ name: 'offset', type: Number, required: false, default: 0 })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Jobs retrieved',
    type: [JobStatusDto],
  })
  async getJobs(
    @Query() query: JobQueryDto,
    @Tenant() tenantId: string,
  ): Promise<JobStatusDto[]> {
    return this.jobsService.getJobsByTenant(tenantId, {
      type: query.type,
      status: query.status,
      limit: query.limit,
      offset: query.offset,
    });
  }

  @Post(':jobId/retry')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Retry a failed job' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Job retried successfully' 
  })
  async retryJob(@Param('jobId') jobId: string) {
    const job = await this.jobsService.retryJob(jobId);
    if (!job) {
      throw new Error('Job not found or not in failed state');
    }

    return {
      jobId: job.id,
      message: 'Job retried successfully',
      attempts: job.attemptsMade,
    };
  }

  @Delete(':jobId')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cancel a job' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Job cancelled successfully' 
  })
  async cancelJob(@Param('jobId') jobId: string) {
    const cancelled = await this.jobsService.cancelJob(jobId);
    
    return {
      jobId,
      cancelled,
      message: cancelled ? 'Job cancelled successfully' : 'Job not found',
    };
  }

  @Post(':jobId/dead-letter')
  @Roles('admin')
  @ApiOperation({ summary: 'Move job to dead letter queue' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Job moved to dead letter queue' 
  })
  async moveToDeadLetter(
    @Param('jobId') jobId: string,
    @Body('reason') reason: string,
  ) {
    await this.jobsService.moveToDeadLetter(jobId, reason);
    
    return {
      jobId,
      message: 'Job moved to dead letter queue',
      reason,
    };
  }

  @Get('queues/metrics')
  @Roles('admin', 'manager')
  @ApiOperation({ 
    summary: 'Get queue metrics',
    description: 'Retrieve real-time metrics and statistics for job queues' 
  })
  @ApiQuery({ 
    name: 'type', 
    enum: JobType, 
    required: false,
    description: 'Filter metrics by specific queue type' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Queue metrics retrieved',
    type: [QueueStatusDto],
  })
  async getQueueMetrics(
    @Query('type') type?: JobType,
  ): Promise<QueueMetrics | QueueMetrics[]> {
    return this.jobsService.getQueueMetrics(type);
  }

  @Post('queues/:type/pause')
  @Roles('admin')
  @ApiOperation({ summary: 'Pause a queue' })
  @ApiParam({ name: 'type', enum: JobType })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Queue paused successfully' 
  })
  async pauseQueue(@Param('type') type: JobType) {
    await this.jobsService.pauseQueue(type);
    
    return {
      queue: type,
      status: 'paused',
      message: 'Queue paused successfully',
    };
  }

  @Post('queues/:type/resume')
  @Roles('admin')
  @ApiOperation({ summary: 'Resume a queue' })
  @ApiParam({ name: 'type', enum: JobType })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Queue resumed successfully' 
  })
  async resumeQueue(@Param('type') type: JobType) {
    await this.jobsService.resumeQueue(type);
    
    return {
      queue: type,
      status: 'active',
      message: 'Queue resumed successfully',
    };
  }

  @Post('queues/:type/clean')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean old jobs from queue' })
  @ApiParam({ name: 'type', enum: JobType })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Queue cleaned successfully' 
  })
  async cleanQueue(
    @Param('type') type: JobType,
    @Body() cleanJobsDto: CleanJobsDto,
  ) {
    const removed = await this.jobsService.cleanOldJobs(
      type,
      cleanJobsDto.grace,
      cleanJobsDto.status,
    );

    return {
      queue: type,
      removed: removed.length,
      message: `Removed ${removed.length} jobs from queue`,
    };
  }

  @Get('health/check')
  @ApiOperation({ 
    summary: 'Check job system health',
    description: 'Get overall health status of the job processing system' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Job system health status',
    schema: {
      properties: {
        status: { 
          type: 'string', 
          enum: ['healthy', 'degraded'],
          example: 'healthy' 
        },
        queues: { type: 'number', example: 4 },
        totalJobs: { type: 'number', example: 1234 },
        metrics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'file-analysis' },
              active: { type: 'number', example: 5 },
              failed: { type: 'number', example: 2 },
              failedRate: { type: 'number', example: 2.5 },
              paused: { type: 'boolean', example: false }
            }
          }
        }
      }
    }
  })
  async checkHealth() {
    const metrics = await this.jobsService.getQueueMetrics();
    const queues = Array.isArray(metrics) ? metrics : [metrics];

    const healthy = queues.every(q => !q.paused && q.failedRate < 50);
    const totalJobs = queues.reduce((sum, q) => 
      sum + q.waiting + q.active + q.completed + q.failed + q.delayed, 0
    );

    return {
      status: healthy ? 'healthy' : 'degraded',
      queues: queues.length,
      totalJobs,
      metrics: queues.map(q => ({
        name: q.name,
        active: q.active,
        failed: q.failed,
        failedRate: q.failedRate,
        paused: q.paused,
      })),
    };
  }
}