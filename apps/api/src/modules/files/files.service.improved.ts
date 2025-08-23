import { 
  Injectable, 
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as AWS from 'aws-sdk';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { FileType, FILE_SIZE_LIMITS } from '@madfam/shared';
import { CacheService } from '@/cache/cache.service';
import { Prisma } from '@prisma/client';

export interface PresignedUrlResponse {
  uploadUrl: string;
  uploadFields: Record<string, string>;
  fileId: string;
  key: string;
}

export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: FileType[];
  validateContent?: boolean;
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private s3: AWS.S3;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {
    this.region = this.configService.get<string>('AWS_S3_REGION') || 'us-east-1';
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || 'madfam-uploads';
    
    this.s3 = new AWS.S3({
      region: this.region,
      signatureVersion: 'v4',
      maxRetries: 3,
      httpOptions: {
        timeout: 30000,
        connectTimeout: 5000,
      },
    });

    // Verify S3 configuration on startup
    this.verifyS3Configuration();
  }

  async createPresignedUpload(
    tenantId: string,
    filename: string,
    fileType: FileType,
    fileSize: number,
    userId?: string,
    options?: FileValidationOptions,
  ): Promise<PresignedUrlResponse> {
    try {
      // Validate inputs
      this.validateFileUpload(filename, fileType, fileSize, options);

      // Generate unique file ID and key
      const fileId = uuidv4();
      const timestamp = Date.now();
      const safeFilename = this.sanitizeFilename(filename);
      const key = `${tenantId}/uploads/${timestamp}-${fileId}/${safeFilename}`;

      // Create presigned POST data with security policies
      const presignedPost = await this.createSecurePresignedPost(
        key,
        fileType,
        fileSize,
        tenantId,
        fileId,
        filename,
      );

      // Create file record in database
      await this.createFileRecord({
        id: fileId,
        tenantId,
        filename: safeFilename,
        originalName: filename,
        type: fileType,
        size: fileSize,
        path: key,
        uploadedBy: userId,
      });

      this.logger.log(`Created presigned upload for file ${fileId}`);

      return {
        uploadUrl: presignedPost.url,
        uploadFields: presignedPost.fields,
        fileId,
        key,
      };
    } catch (error) {
      this.logger.error('Failed to create presigned upload', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create file upload');
    }
  }

  async confirmUpload(
    tenantId: string,
    fileId: string,
    ndaAcceptanceId?: string,
  ): Promise<void> {
    const file = await this.findOne(fileId, tenantId);

    try {
      // Verify file exists in S3 with retries
      const headResult = await this.verifyS3Object(file.path);

      // Download and hash file for integrity check
      const fileData = await this.downloadFromS3(file.path);
      const hash = this.calculateFileHash(fileData);

      // Update file record with verified data
      await this.prisma.file.update({
        where: { id: fileId },
        data: {
          hash,
          size: headResult.ContentLength || file.size,
          ndaAcceptanceId,
          metadata: {
            ...(file.metadata as any || {}),
            status: 'confirmed',
            confirmedAt: new Date().toISOString(),
            contentType: headResult.ContentType,
            etag: headResult.ETag,
          },
        },
      });

      // Cache file metadata for quick access
      await this.cacheFileMetadata(fileId, tenantId, {
        id: fileId,
        path: file.path,
        size: headResult.ContentLength || file.size,
        contentType: headResult.ContentType,
        hash,
      });

      this.logger.log(`Confirmed upload for file ${fileId}`);
    } catch (error) {
      await this.markFileAsFailed(fileId, error);
      throw new BadRequestException('File upload verification failed');
    }
  }

  async findOne(fileId: string, tenantId: string): Promise<any> {
    // Check cache first
    const cached = await this.getCachedFileMetadata(fileId, tenantId);
    if (cached) {
      return cached;
    }

    const file = await this.prisma.file.findFirst({
      where: {
        id: fileId,
        tenantId,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async getFileUrl(
    tenantId: string, 
    fileId: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const file = await this.findOne(fileId, tenantId);

    // Check cache for existing URL
    const cacheKey = `file-url:${fileId}`;
    const cachedUrl = await this.cacheService.get(cacheKey);
    if (cachedUrl) {
      return cachedUrl;
    }

    try {
      // Generate temporary signed URL
      const url = await this.s3.getSignedUrlPromise('getObject', {
        Bucket: this.bucketName,
        Key: file.path,
        Expires: expiresIn,
        ResponseContentDisposition: `inline; filename="${file.originalName}"`,
      });

      // Cache URL for slightly less than expiration time
      await this.cacheService.set(cacheKey, url, Math.floor(expiresIn * 0.9));

      return url;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL for file ${fileId}`, error);
      throw new InternalServerErrorException('Failed to generate file URL');
    }
  }

  async downloadFile(fileId: string, tenantId: string): Promise<Buffer> {
    const file = await this.findOne(fileId, tenantId);

    try {
      return await this.downloadFromS3(file.path);
    } catch (error) {
      this.logger.error(`Failed to download file ${fileId}`, error);
      throw new InternalServerErrorException('Failed to download file');
    }
  }

  async deleteFile(tenantId: string, fileId: string): Promise<void> {
    const file = await this.findOne(fileId, tenantId);

    try {
      // Delete from S3
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: file.path,
      }).promise();

      // Delete from database
      await this.prisma.file.delete({
        where: { id: fileId },
      });

      // Clear cache
      await this.clearFileCache(fileId, tenantId);

      this.logger.log(`Deleted file ${fileId}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${fileId}`, error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  async batchDelete(tenantId: string, fileIds: string[]): Promise<void> {
    const files = await this.prisma.file.findMany({
      where: {
        id: { in: fileIds },
        tenantId,
      },
    });

    if (files.length === 0) {
      return;
    }

    try {
      // Delete from S3 in batch
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: files.map(f => ({ Key: f.path })),
          Quiet: true,
        },
      };

      await this.s3.deleteObjects(deleteParams).promise();

      // Delete from database
      await this.prisma.file.deleteMany({
        where: {
          id: { in: fileIds },
          tenantId,
        },
      });

      // Clear cache for all files
      await Promise.all(
        fileIds.map(id => this.clearFileCache(id, tenantId))
      );

      this.logger.log(`Batch deleted ${files.length} files`);
    } catch (error) {
      this.logger.error('Failed to batch delete files', error);
      throw new InternalServerErrorException('Failed to delete files');
    }
  }

  // Private helper methods
  private async verifyS3Configuration(): Promise<void> {
    try {
      await this.s3.headBucket({ Bucket: this.bucketName }).promise();
      this.logger.log(`S3 bucket ${this.bucketName} is accessible`);
    } catch (error) {
      this.logger.error(`S3 bucket ${this.bucketName} is not accessible`, error);
      throw new InternalServerErrorException('S3 configuration error');
    }
  }

  private validateFileUpload(
    filename: string,
    fileType: FileType,
    fileSize: number,
    options?: FileValidationOptions,
  ): void {
    // Validate file size
    const maxSize = options?.maxSizeMB || FILE_SIZE_LIMITS.maxFileSizeMB;
    if (fileSize > maxSize * 1024 * 1024) {
      throw new BadRequestException(
        `File size exceeds maximum of ${maxSize}MB`,
      );
    }

    // Validate file type
    const allowedTypes = options?.allowedTypes || Object.values(FileType);
    if (!allowedTypes.includes(fileType)) {
      throw new BadRequestException(`File type ${fileType} is not allowed`);
    }

    // Validate file extension
    const allowedExtensions = this.getAllowedExtensions(fileType);
    const extension = filename.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      throw new BadRequestException(
        `Invalid file extension .${extension} for type ${fileType}`,
      );
    }

    // Validate filename
    if (filename.length > 255) {
      throw new BadRequestException('Filename is too long');
    }

    if (!/^[\w\-. ]+$/.test(filename)) {
      throw new BadRequestException('Filename contains invalid characters');
    }
  }

  private async createSecurePresignedPost(
    key: string,
    fileType: FileType,
    fileSize: number,
    tenantId: string,
    fileId: string,
    originalName: string,
  ): Promise<AWS.S3.PresignedPost> {
    const contentType = this.getContentType(fileType);
    
    const params = {
      Bucket: this.bucketName,
      Fields: {
        key,
        'Content-Type': contentType,
        'x-amz-meta-tenant-id': tenantId,
        'x-amz-meta-file-id': fileId,
        'x-amz-meta-original-name': originalName,
        'x-amz-meta-file-type': fileType,
        'x-amz-server-side-encryption': 'AES256',
      },
      Expires: 300, // 5 minutes
      Conditions: [
        ['content-length-range', 0, fileSize + 1024], // Allow small overhead
        ['starts-with', '$Content-Type', contentType],
        ['eq', '$x-amz-server-side-encryption', 'AES256'],
      ],
    };

    return this.s3.createPresignedPost(params);
  }

  private async createFileRecord(data: {
    id: string;
    tenantId: string;
    filename: string;
    originalName: string;
    type: FileType;
    size: number;
    path: string;
    uploadedBy?: string;
  }): Promise<void> {
    await this.prisma.file.create({
      data: {
        ...data,
        hash: '', // Will be updated after upload confirmation
        metadata: {
          uploadedBy: data.uploadedBy,
          status: 'pending',
          uploadStarted: new Date().toISOString(),
        },
      },
    });
  }

  private async verifyS3Object(key: string): Promise<AWS.S3.HeadObjectOutput> {
    let attempts = 0;
    const maxAttempts = 3;
    const delay = 1000;

    while (attempts < maxAttempts) {
      try {
        return await this.s3.headObject({
          Bucket: this.bucketName,
          Key: key,
        }).promise();
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay * attempts));
      }
    }

    throw new Error('Failed to verify S3 object');
  }

  private async downloadFromS3(key: string): Promise<Buffer> {
    const result = await this.s3.getObject({
      Bucket: this.bucketName,
      Key: key,
    }).promise();

    if (!result.Body) {
      throw new Error('Empty file body');
    }

    return result.Body as Buffer;
  }

  private calculateFileHash(data: Buffer): string {
    return createHash('sha256')
      .update(data)
      .digest('hex');
  }

  private async markFileAsFailed(fileId: string, error: any): Promise<void> {
    const errorMessage = error?.message || 'Unknown error';
    
    await this.prisma.file.update({
      where: { id: fileId },
      data: {
        metadata: Prisma.JsonNull,
      },
    }).then(() => 
      this.prisma.file.update({
        where: { id: fileId },
        data: {
          metadata: {
            status: 'failed',
            error: errorMessage,
            failedAt: new Date().toISOString(),
          },
        },
      })
    );
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();
  }

  private getContentType(fileType: FileType): string {
    const contentTypes: Record<FileType, string> = {
      stl: 'model/stl',
      step: 'model/step',
      iges: 'model/iges',
      dxf: 'application/dxf',
      dwg: 'application/dwg',
      pdf: 'application/pdf',
    };
    return contentTypes[fileType] || 'application/octet-stream';
  }

  private getAllowedExtensions(fileType: FileType): string[] {
    const extensions: Record<FileType, string[]> = {
      stl: ['stl'],
      step: ['step', 'stp'],
      iges: ['iges', 'igs'],
      dxf: ['dxf'],
      dwg: ['dwg'],
      pdf: ['pdf'],
    };
    return extensions[fileType] || [];
  }

  // Cache management
  private async cacheFileMetadata(
    fileId: string,
    tenantId: string,
    metadata: any,
  ): Promise<void> {
    const cacheKey = `file:${tenantId}:${fileId}`;
    await this.cacheService.set(cacheKey, metadata, 3600); // 1 hour
  }

  private async getCachedFileMetadata(
    fileId: string,
    tenantId: string,
  ): Promise<any> {
    const cacheKey = `file:${tenantId}:${fileId}`;
    return this.cacheService.get(cacheKey);
  }

  private async clearFileCache(
    fileId: string,
    tenantId: string,
  ): Promise<void> {
    const keys = [
      `file:${tenantId}:${fileId}`,
      `file-url:${fileId}`,
    ];
    await Promise.all(keys.map(key => this.cacheService.delete(key)));
  }
}