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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FilesService, PresignedUrlResponse } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePresignedUploadDto } from './dto/create-presigned-upload.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('presign')
  @ApiOperation({ summary: 'Create presigned upload URL' })
  @ApiResponse({ status: 201, description: 'Presigned URL created' })
  async createPresignedUpload(
    @Request() req,
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
  @ApiOperation({ summary: 'Confirm file upload' })
  @ApiResponse({ status: 204, description: 'Upload confirmed' })
  async confirmUpload(
    @Request() req,
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
  @ApiOperation({ summary: 'Get temporary download URL' })
  @ApiResponse({ status: 200, description: 'Download URL generated' })
  async getFileUrl(
    @Request() req,
    @Param('id') fileId: string,
  ): Promise<{ url: string }> {
    const url = await this.filesService.getFileUrl(req.user.tenantId, fileId);
    return { url };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 204, description: 'File deleted' })
  async deleteFile(
    @Request() req,
    @Param('id') fileId: string,
  ): Promise<void> {
    await this.filesService.deleteFile(req.user.tenantId, fileId);
  }
}