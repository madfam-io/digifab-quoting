import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import { basename } from 'path';
import { lookup } from 'mime-types';
import { LoggerService } from '@/common/logger/logger.service';

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: Date;
}

@Injectable()
export class ReportUploaderService {
  private s3: S3;
  private bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.s3 = new S3({
      region: this.configService.get('aws.region'),
      accessKeyId: this.configService.get('aws.accessKeyId'),
      secretAccessKey: this.configService.get('aws.secretAccessKey'),
    });
    this.bucketName = this.configService.get('aws.s3.bucketName', 'madfam-reports');
  }

  async uploadReport(
    filePath: string,
    tenantId: string,
    reportType: string,
    reportId: string,
  ): Promise<UploadResult> {
    const fileName = basename(filePath);
    const contentType = lookup(fileName) || 'application/octet-stream';
    const key = this.generateS3Key(tenantId, reportType, reportId, fileName);

    this.logger.log(`Uploading report to S3: ${key}`);

    try {
      // Get file size
      const { size: fileSize } = await this.getFileStats(filePath);

      // Upload to S3
      await this.uploadToS3(filePath, key, contentType);

      // Clean up temporary file
      await this.cleanupTempFile(filePath);

      const fileUrl = this.getFileUrl(key);

      this.logger.log(`Report uploaded successfully: ${fileUrl}`);

      return {
        fileUrl,
        fileName,
        fileSize,
        contentType,
        uploadedAt: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Failed to upload report: ${errorMessage}`, errorStack);

      // Try to clean up temp file even if upload failed
      await this.cleanupTempFile(filePath).catch(() => {});

      throw error;
    }
  }

  async generatePresignedUrl(
    key: string,
    expiresIn: number = 3600, // 1 hour default
  ): Promise<string> {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresIn,
    });
  }

  async deleteReport(key: string): Promise<void> {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.bucketName,
          Key: key,
        })
        .promise();

      this.logger.log(`Report deleted from S3: ${key}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Failed to delete report: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async copyReport(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      await this.s3
        .copyObject({
          Bucket: this.bucketName,
          CopySource: `${this.bucketName}/${sourceKey}`,
          Key: destinationKey,
        })
        .promise();

      this.logger.log(`Report copied: ${sourceKey} -> ${destinationKey}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Failed to copy report: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async listReports(prefix: string, maxKeys: number = 100): Promise<S3.Object[]> {
    try {
      const result = await this.s3
        .listObjectsV2({
          Bucket: this.bucketName,
          Prefix: prefix,
          MaxKeys: maxKeys,
        })
        .promise();

      return result.Contents || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Failed to list reports: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  private generateS3Key(
    tenantId: string,
    reportType: string,
    reportId: string,
    fileName: string,
  ): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Structure: tenants/{tenantId}/reports/{year}/{month}/{day}/{reportType}/{reportId}/{fileName}
    return `tenants/${tenantId}/reports/${year}/${month}/${day}/${reportType}/${reportId}/${fileName}`;
  }

  private async uploadToS3(
    filePath: string,
    key: string,
    contentType: string,
  ): Promise<S3.ManagedUpload.SendData> {
    const fileStream = createReadStream(filePath);

    const params: S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
      Metadata: {
        'uploaded-by': 'report-generation-service',
        'upload-time': new Date().toISOString(),
      },
    };

    // Add cache control for PDF files
    if (contentType === 'application/pdf') {
      params.CacheControl = 'max-age=3600'; // 1 hour
    }

    return this.s3.upload(params).promise();
  }

  private getFileUrl(key: string): string {
    // Return the S3 object key instead of direct URL for security
    // The application should generate presigned URLs when needed
    return `s3://${this.bucketName}/${key}`;
  }

  private async getFileStats(filePath: string): Promise<{ size: number }> {
    const { stat } = await import('fs/promises');
    const stats = await stat(filePath);
    return { size: stats.size };
  }

  private async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
      this.logger.debug(`Temporary file deleted: ${filePath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to delete temporary file: ${filePath}`, errorMessage);
    }
  }

  async getReportMetadata(key: string): Promise<S3.HeadObjectOutput> {
    try {
      return await this.s3
        .headObject({
          Bucket: this.bucketName,
          Key: key,
        })
        .promise();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Failed to get report metadata: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  async setReportExpiration(key: string, daysToExpire: number): Promise<void> {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + daysToExpire);

      await this.s3
        .putObjectTagging({
          Bucket: this.bucketName,
          Key: key,
          Tagging: {
            TagSet: [
              {
                Key: 'expiration-date',
                Value: expirationDate.toISOString(),
              },
              {
                Key: 'auto-delete',
                Value: 'true',
              },
            ],
          },
        })
        .promise();

      this.logger.log(`Set expiration for report ${key} to ${expirationDate.toISOString()}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : String(error);
      this.logger.error(`Failed to set report expiration: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
