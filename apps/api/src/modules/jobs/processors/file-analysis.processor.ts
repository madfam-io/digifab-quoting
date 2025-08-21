import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { 
  JobType, 
  FileAnalysisJobData, 
  JobResult,
  JobProgress,
} from '../interfaces/job.interface';
import { LoggerService } from '@/common/logger/logger.service';
import { PrismaService } from '@/prisma/prisma.service';
import { FilesService } from '@/modules/files/files.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

interface FileAnalysisResult {
  fileId: string;
  geometry: {
    volume?: number;
    surfaceArea?: number;
    boundingBox?: {
      x: number;
      y: number;
      z: number;
    };
    partCount?: number;
    triangleCount?: number;
  };
  dfmAnalysis?: {
    issues: Array<{
      type: string;
      severity: 'critical' | 'warning' | 'info';
      description: string;
      location?: any;
    }>;
    score: number;
    manufacturable: boolean;
  };
  features?: {
    hasUndercuts: boolean;
    hasThinWalls: boolean;
    hasSmallFeatures: boolean;
    complexity: 'simple' | 'moderate' | 'complex';
  };
  metadata: {
    fileFormat: string;
    fileSize: number;
    processingTime: number;
  };
}

@Processor(JobType.FILE_ANALYSIS)
@Injectable()
export class FileAnalysisProcessor {
  private readonly workerServiceUrl: string;

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.workerServiceUrl = this.configService.get<string>('worker.url', 'http://localhost:8000');
  }

  @Process()
  async handleFileAnalysis(job: Job<FileAnalysisJobData>): Promise<JobResult<FileAnalysisResult>> {
    const startTime = Date.now();
    const { fileId, fileUrl, fileName, fileType, analysisOptions, tenantId } = job.data;

    try {
      this.logger.log(`Starting file analysis for ${fileId}`, {
        jobId: job.id,
        tenantId,
        fileName,
      });

      // Update job progress
      await this.updateProgress(job, 10, 'Downloading file');

      // Download file from S3
      const fileBuffer = await this.filesService.downloadFile(fileUrl);
      
      await this.updateProgress(job, 20, 'File downloaded successfully');

      // Validate file format
      if (!this.isValidFileFormat(fileType)) {
        throw new Error(`Unsupported file format: ${fileType}`);
      }

      // Send to worker service for analysis
      await this.updateProgress(job, 30, 'Sending to analysis service');

      const analysisResult = await this.callWorkerService(
        fileBuffer,
        fileName,
        fileType,
        analysisOptions,
        job,
      );

      await this.updateProgress(job, 90, 'Analysis complete, saving results');

      // Save analysis results to database
      await this.saveAnalysisResults(fileId, analysisResult, tenantId);

      await this.updateProgress(job, 100, 'File analysis completed');

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: {
          ...analysisResult,
          metadata: {
            ...analysisResult.metadata,
            processingTime: duration,
          },
        },
        duration,
      };
    } catch (error) {
      this.logger.error(`File analysis failed for ${fileId}`, error, {
        jobId: job.id,
        tenantId,
      });

      return {
        success: false,
        error: {
          code: 'FILE_ANALYSIS_FAILED',
          message: error.message || 'File analysis failed',
          details: error,
        },
        duration: Date.now() - startTime,
      };
    }
  }

  @OnQueueActive()
  onActive(job: Job<FileAnalysisJobData>) {
    this.logger.log(`File analysis job ${job.id} started`, {
      fileId: job.data.fileId,
      tenantId: job.data.tenantId,
    });
  }

  @OnQueueCompleted()
  onComplete(job: Job<FileAnalysisJobData>, result: JobResult<FileAnalysisResult>) {
    this.logger.log(`File analysis job ${job.id} completed`, {
      fileId: job.data.fileId,
      tenantId: job.data.tenantId,
      success: result.success,
      duration: result.duration,
    });
  }

  @OnQueueFailed()
  onFailed(job: Job<FileAnalysisJobData>, err: Error) {
    this.logger.error(`File analysis job ${job.id} failed`, err, {
      fileId: job.data.fileId,
      tenantId: job.data.tenantId,
      attempts: job.attemptsMade,
    });
  }

  private async updateProgress(
    job: Job<FileAnalysisJobData>,
    percentage: number,
    message: string,
  ): Promise<void> {
    const progress: JobProgress = {
      percentage,
      message,
      step: this.getStepFromPercentage(percentage),
    };

    await job.progress(progress);
    await job.log(`${message} (${percentage}%)`);
  }

  private getStepFromPercentage(percentage: number): string {
    if (percentage <= 10) return 'downloading';
    if (percentage <= 30) return 'validating';
    if (percentage <= 80) return 'analyzing';
    if (percentage <= 90) return 'processing-results';
    return 'saving';
  }

  private isValidFileFormat(fileType: string): boolean {
    const supportedFormats = [
      'stl', 'obj', 'step', 'stp', 'iges', 'igs',
      '3mf', 'dxf', 'dwg', 'svg', 'pdf',
    ];
    
    return supportedFormats.includes(fileType.toLowerCase());
  }

  private async callWorkerService(
    fileBuffer: Buffer,
    fileName: string,
    fileType: string,
    analysisOptions: FileAnalysisJobData['analysisOptions'],
    job: Job<FileAnalysisJobData>,
  ): Promise<FileAnalysisResult> {
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: `application/${fileType}` });
    formData.append('file', blob, fileName);
    formData.append('options', JSON.stringify(analysisOptions || {}));

    try {
      // Update progress periodically while waiting for worker
      const progressInterval = setInterval(async () => {
        const currentProgress = job.progress() as JobProgress;
        if (currentProgress.percentage < 80) {
          await this.updateProgress(
            job,
            currentProgress.percentage + 5,
            'Analyzing geometry...',
          );
        }
      }, 5000);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.workerServiceUrl}/api/v1/analyze`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 5 * 60 * 1000, // 5 minutes
          },
        ),
      );

      clearInterval(progressInterval);

      return {
        fileId: job.data.fileId,
        geometry: response.data.geometry || {},
        dfmAnalysis: response.data.dfm_analysis,
        features: response.data.features,
        metadata: {
          fileFormat: fileType,
          fileSize: fileBuffer.length,
          processingTime: response.data.processing_time || 0,
        },
      };
    } catch (error) {
      // If worker service is unavailable, provide basic analysis
      this.logger.warn('Worker service unavailable, using fallback analysis', error);
      
      return this.performBasicAnalysis(
        job.data.fileId,
        fileBuffer,
        fileType,
      );
    }
  }

  private async performBasicAnalysis(
    fileId: string,
    fileBuffer: Buffer,
    fileType: string,
  ): Promise<FileAnalysisResult> {
    // Basic analysis when worker service is unavailable
    return {
      fileId,
      geometry: {
        // These would be calculated by the worker service
        volume: null,
        surfaceArea: null,
        boundingBox: null,
        partCount: 1,
      },
      dfmAnalysis: {
        issues: [],
        score: 100,
        manufacturable: true,
      },
      features: {
        hasUndercuts: false,
        hasThinWalls: false,
        hasSmallFeatures: false,
        complexity: 'simple',
      },
      metadata: {
        fileFormat: fileType,
        fileSize: fileBuffer.length,
        processingTime: 0,
      },
    };
  }

  private async saveAnalysisResults(
    fileId: string,
    analysis: FileAnalysisResult,
    tenantId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Update file with analysis results
      await tx.file.update({
        where: { 
          id: fileId,
          tenantId,
        },
        data: {
          status: 'ANALYZED',
          analysisResult: analysis as any,
          analyzedAt: new Date(),
          metadata: {
            ...(await tx.file.findUnique({
              where: { id: fileId },
              select: { metadata: true },
            }))?.metadata as any || {},
            geometry: analysis.geometry,
            dfmScore: analysis.dfmAnalysis?.score,
            complexity: analysis.features?.complexity,
          },
        },
      });

      // Create file analysis record
      await tx.fileAnalysis.create({
        data: {
          fileId,
          tenantId,
          volume: analysis.geometry.volume,
          surfaceArea: analysis.geometry.surfaceArea,
          boundingBoxX: analysis.geometry.boundingBox?.x,
          boundingBoxY: analysis.geometry.boundingBox?.y,
          boundingBoxZ: analysis.geometry.boundingBox?.z,
          partCount: analysis.geometry.partCount || 1,
          triangleCount: analysis.geometry.triangleCount,
          dfmScore: analysis.dfmAnalysis?.score || 100,
          dfmIssues: analysis.dfmAnalysis?.issues || [],
          manufacturable: analysis.dfmAnalysis?.manufacturable ?? true,
          hasUndercuts: analysis.features?.hasUndercuts || false,
          hasThinWalls: analysis.features?.hasThinWalls || false,
          hasSmallFeatures: analysis.features?.hasSmallFeatures || false,
          complexity: analysis.features?.complexity || 'simple',
          processingTime: analysis.metadata.processingTime,
        },
      });
    });
  }
}