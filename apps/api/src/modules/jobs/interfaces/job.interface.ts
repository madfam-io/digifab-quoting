import { Job } from 'bull';

export enum JobType {
  FILE_ANALYSIS = 'file-analysis',
  QUOTE_CALCULATION = 'quote-calculation',
  EMAIL_NOTIFICATION = 'email-notification',
  REPORT_GENERATION = 'report-generation',
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  STALLED = 'stalled',
  STUCK = 'stuck',
}

export interface JobProgress {
  percentage: number;
  message?: string;
  step?: string;
  metadata?: Record<string, unknown>;
}

export interface BaseJobData {
  tenantId: string;
  userId?: string;
  correlationId?: string;
  priority?: number;
  metadata?: Record<string, unknown>;
}

export interface FileAnalysisJobData extends BaseJobData {
  fileId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  analysisOptions?: {
    performDfm?: boolean;
    extractGeometry?: boolean;
    calculateVolume?: boolean;
    detectFeatures?: boolean;
  };
}

export interface QuoteCalculationJobData extends BaseJobData {
  quoteId: string;
  items: Array<{
    fileId: string;
    quantity: number;
    material: string;
    process: string;
    finishOptions?: Record<string, unknown>;
  }>;
  rushOrder?: boolean;
  currency?: string;
}

export interface EmailNotificationJobData extends BaseJobData {
  type: 'quote-ready' | 'quote-accepted' | 'quote-expired' | 'order-shipped';
  recipientEmail: string;
  recipientName?: string;
  templateData: Record<string, unknown>;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
}

export interface ReportGenerationJobData extends BaseJobData {
  reportType: 'quote' | 'order' | 'invoice' | 'analytics';
  entityId: string;
  format: 'pdf' | 'excel' | 'csv';
  options?: {
    includeItemDetails?: boolean;
    includeTerms?: boolean;
    includeTechnicalSpecs?: boolean;
    language?: 'en' | 'es';
  };
}

export interface JobResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: Record<string, unknown>;
  duration?: number;
}

export interface JobOptions {
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
  priority?: number;
  timeout?: number;
}

export interface JobMetrics {
  jobId: string;
  type: JobType;
  status: JobStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  progress: number;
  attempts: number;
  error?: string;
  result?: unknown;
  duration?: number;
}

export interface QueueMetrics {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
  completedRate: number;
  failedRate: number;
  avgProcessingTime: number;
}

export type JobData =
  | FileAnalysisJobData
  | QuoteCalculationJobData
  | EmailNotificationJobData
  | ReportGenerationJobData;

export type TypedJob<T extends JobData> = Job<T>;
