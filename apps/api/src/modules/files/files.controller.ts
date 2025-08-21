import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiHeader, ApiPayloadTooLargeResponse } from '@nestjs/swagger';
import { FilesService, PresignedUrlResponse } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
    tenantId: string;
    email: string;
    roles: string[];
  };
}
import { CreatePresignedUploadDto, PresignedUploadResponseDto } from './dto/create-presigned-upload.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import { UnauthorizedResponseDto, ValidationErrorResponseDto, NotFoundResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ 
  description: 'Unauthorized - Invalid or missing JWT token',
  type: UnauthorizedResponseDto 
})
@ApiHeader({
  name: 'X-Tenant-ID',
  description: 'Tenant identifier for multi-tenant operations',
  required: false
})
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('presign')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create presigned upload URL',
    description: 'Generate a presigned URL for secure direct file upload to S3' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Presigned URL created successfully',
    type: PresignedUploadResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid file type or size',
    type: ValidationErrorResponseDto 
  })
  @ApiPayloadTooLargeResponse({
    description: 'File size exceeds 200MB limit'
  })
  async createPresignedUpload(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreatePresignedUploadDto,
  ): Promise<PresignedUrlResponse> {
    return this.filesService.createPresignedUpload(
      req.user.tenantId,
      dto.filename,
      dto.type,
      dto.size,
      req.user.id,
    );
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Confirm file upload',
    description: 'Confirm that file upload to S3 was successful and trigger processing' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'File ID from presigned upload',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Upload confirmed successfully' 
  })
  @ApiNotFoundResponse({ 
    description: 'File not found or already confirmed',
    type: NotFoundResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'File upload not completed or validation failed',
    type: ValidationErrorResponseDto 
  })
  async confirmUpload(
    @Request() req: AuthenticatedRequest,
    @Param('id') fileId: string,
    @Body() dto: ConfirmUploadDto,
  ): Promise<void> {
    await this.filesService.confirmUpload(
      req.user.tenantId,
      fileId,
      dto.ndaAcceptanceId,
    );
  }

  @Get(':id/url')
  @ApiOperation({ 
    summary: 'Get temporary download URL',
    description: 'Generate a temporary presigned URL for downloading the file' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Download URL generated',
    schema: {
      properties: {
        url: { 
          type: 'string', 
          example: 'https://s3.amazonaws.com/bucket/files/123e4567.stl?X-Amz-Algorithm=...',
          description: 'Presigned download URL (valid for 1 hour)' 
        }
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'File not found',
    type: NotFoundResponseDto 
  })
  async getFileUrl(
    @Request() req: AuthenticatedRequest,
    @Param('id') fileId: string,
  ): Promise<{ url: string }> {
    const url = await this.filesService.getFileUrl(req.user.tenantId, fileId);
    return { url };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete file',
    description: 'Delete a file from storage. Files associated with active quotes cannot be deleted.' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'File ID',
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @ApiResponse({ 
    status: 204, 
    description: 'File deleted successfully' 
  })
  @ApiNotFoundResponse({ 
    description: 'File not found',
    type: NotFoundResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'File is associated with an active quote',
    type: ValidationErrorResponseDto 
  })
  async deleteFile(
    @Request() req: AuthenticatedRequest,
    @Param('id') fileId: string,
  ): Promise<void> {
    await this.filesService.deleteFile(req.user.tenantId, fileId);
  }
}