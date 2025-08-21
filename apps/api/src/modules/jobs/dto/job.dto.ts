import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsNumber, IsString, IsArray, Min, Max, IsBoolean, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { JobType, JobStatus, JobOptions } from '../interfaces/job.interface';

export class JobOptionsDto implements JobOptions {
  @ApiPropertyOptional({ description: 'Delay in milliseconds before processing' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  delay?: number;

  @ApiPropertyOptional({ description: 'Number of attempts before failing', default: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  attempts?: number;

  @ApiPropertyOptional({ 
    description: 'Backoff configuration',
    example: { type: 'exponential', delay: 5000 }
  })
  @IsOptional()
  @IsObject()
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };

  @ApiPropertyOptional({ description: 'Remove job after completion' })
  @IsOptional()
  @IsBoolean()
  removeOnComplete?: boolean | number;

  @ApiPropertyOptional({ description: 'Remove job after failure' })
  @IsOptional()
  @IsBoolean()
  removeOnFail?: boolean | number;

  @ApiPropertyOptional({ description: 'Job priority (higher = more priority)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  priority?: number;

  @ApiPropertyOptional({ description: 'Job timeout in milliseconds' })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(3600000) // Max 1 hour
  timeout?: number;
}

export class CreateJobDto {
  @ApiProperty({ enum: JobType, description: 'Type of job to create' })
  @IsEnum(JobType)
  type!: JobType;

  @ApiProperty({ description: 'Job data payload' })
  @IsObject()
  data!: Record<string, any>;

  @ApiPropertyOptional({ description: 'Job processing options' })
  @IsOptional()
  @Type(() => JobOptionsDto)
  options?: JobOptionsDto;
}

export class ScheduleJobDto extends CreateJobDto {
  @ApiProperty({ description: 'Delay in milliseconds before processing' })
  @IsNumber()
  @Min(1000) // At least 1 second
  @Max(86400000) // Max 24 hours
  delay!: number;
}

export class RecurringJobDto {
  @ApiProperty({ enum: JobType, description: 'Type of job to create' })
  @IsEnum(JobType)
  type!: JobType;

  @ApiProperty({ description: 'Job data payload' })
  @IsObject()
  data!: Record<string, any>;

  @ApiProperty({ 
    description: 'Cron expression for scheduling',
    example: '0 0 * * *' // Daily at midnight
  })
  @IsString()
  @Matches(/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/)
  cronExpression!: string;

  @ApiPropertyOptional({ description: 'Job processing options' })
  @IsOptional()
  @Type(() => JobOptionsDto)
  options?: JobOptionsDto;
}

export class JobQueryDto {
  @ApiPropertyOptional({ enum: JobType, description: 'Filter by job type' })
  @IsOptional()
  @IsEnum(JobType)
  type?: JobType;

  @ApiPropertyOptional({ enum: JobStatus, description: 'Filter by job status' })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ description: 'Limit number of results', default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @ApiPropertyOptional({ description: 'Offset for pagination', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class JobStatusDto {
  @ApiProperty({ description: 'Job ID' })
  jobId!: string;

  @ApiProperty({ enum: JobType, description: 'Job type' })
  type!: JobType;

  @ApiProperty({ enum: JobStatus, description: 'Current job status' })
  status!: JobStatus;

  @ApiProperty({ description: 'Job creation timestamp' })
  createdAt!: Date;

  @ApiPropertyOptional({ description: 'Job start timestamp' })
  startedAt?: Date;

  @ApiPropertyOptional({ description: 'Job completion timestamp' })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Job failure timestamp' })
  failedAt?: Date;

  @ApiProperty({ description: 'Job progress percentage (0-100)' })
  progress!: number;

  @ApiProperty({ description: 'Number of attempts made' })
  attempts!: number;

  @ApiPropertyOptional({ description: 'Error message if job failed' })
  error?: string;

  @ApiPropertyOptional({ description: 'Job result data' })
  result?: any;

  @ApiPropertyOptional({ description: 'Job duration in milliseconds' })
  duration?: number;
}

export class QueueStatusDto {
  @ApiProperty({ description: 'Queue name' })
  name!: string;

  @ApiProperty({ description: 'Number of waiting jobs' })
  waiting!: number;

  @ApiProperty({ description: 'Number of active jobs' })
  active!: number;

  @ApiProperty({ description: 'Number of completed jobs' })
  completed!: number;

  @ApiProperty({ description: 'Number of failed jobs' })
  failed!: number;

  @ApiProperty({ description: 'Number of delayed jobs' })
  delayed!: number;

  @ApiProperty({ description: 'Whether the queue is paused' })
  paused!: boolean;

  @ApiProperty({ description: 'Completion rate percentage' })
  completedRate!: number;

  @ApiProperty({ description: 'Failure rate percentage' })
  failedRate!: number;

  @ApiProperty({ description: 'Average processing time in milliseconds' })
  avgProcessingTime!: number;
}

export class CleanJobsDto {
  @ApiProperty({ 
    description: 'Grace period in milliseconds',
    example: 86400000 // 24 hours
  })
  @IsNumber()
  @Min(0)
  grace!: number;

  @ApiPropertyOptional({ 
    description: 'Job statuses to clean',
    default: ['completed', 'failed']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['completed', 'failed'], { each: true })
  status?: ('completed' | 'failed')[];
}

// Specific job data DTOs
export class FileAnalysisJobDto {
  @ApiProperty({ description: 'File ID to analyze' })
  @IsString()
  fileId!: string;

  @ApiProperty({ description: 'File URL for downloading' })
  @IsString()
  fileUrl!: string;

  @ApiProperty({ description: 'Original file name' })
  @IsString()
  fileName!: string;

  @ApiProperty({ description: 'File type/extension' })
  @IsString()
  fileType!: string;

  @ApiPropertyOptional({ description: 'Analysis options' })
  @IsOptional()
  @IsObject()
  analysisOptions?: {
    performDfm?: boolean;
    extractGeometry?: boolean;
    calculateVolume?: boolean;
    detectFeatures?: boolean;
  };
}

export class QuoteCalculationJobDto {
  @ApiProperty({ description: 'Quote ID to calculate' })
  @IsString()
  quoteId!: string;

  @ApiProperty({ description: 'Quote items to calculate', type: [Object] })
  @IsArray()
  items!: Array<{
    fileId: string;
    quantity: number;
    material: string;
    process: string;
    finishOptions?: Record<string, any>;
  }>;

  @ApiPropertyOptional({ description: 'Rush order flag' })
  @IsOptional()
  @IsBoolean()
  rushOrder?: boolean;

  @ApiPropertyOptional({ description: 'Currency code', default: 'MXN' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class EmailNotificationJobDto {
  @ApiProperty({ 
    enum: ['quote-ready', 'quote-accepted', 'quote-expired', 'order-shipped'],
    description: 'Email notification type' 
  })
  @IsEnum(['quote-ready', 'quote-accepted', 'quote-expired', 'order-shipped'])
  type!: 'quote-ready' | 'quote-accepted' | 'quote-expired' | 'order-shipped';

  @ApiProperty({ description: 'Recipient email address' })
  @IsString()
  recipientEmail!: string;

  @ApiPropertyOptional({ description: 'Recipient name' })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiProperty({ description: 'Template data for email rendering' })
  @IsObject()
  templateData!: Record<string, any>;

  @ApiPropertyOptional({ description: 'Email attachments', type: [Object] })
  @IsOptional()
  @IsArray()
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
}

export class ReportGenerationJobDto {
  @ApiProperty({ 
    enum: ['quote', 'order', 'invoice', 'analytics'],
    description: 'Report type to generate' 
  })
  @IsEnum(['quote', 'order', 'invoice', 'analytics'])
  reportType!: 'quote' | 'order' | 'invoice' | 'analytics';

  @ApiProperty({ description: 'Entity ID for the report' })
  @IsString()
  entityId!: string;

  @ApiProperty({ 
    enum: ['pdf', 'excel', 'csv'],
    description: 'Report output format' 
  })
  @IsEnum(['pdf', 'excel', 'csv'])
  format!: 'pdf' | 'excel' | 'csv';

  @ApiPropertyOptional({ description: 'Report generation options' })
  @IsOptional()
  @IsObject()
  options?: {
    includeItemDetails?: boolean;
    includeTerms?: boolean;
    includeTechnicalSpecs?: boolean;
    language?: 'en' | 'es';
  };
}