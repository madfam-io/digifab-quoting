import { IsString, IsEnum, IsInt, Min, Max, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '@madfam/shared';

export class CreatePresignedUploadDto {
  @ApiProperty({
    example: 'part123.stl',
    description: 'Original filename with extension',
    minLength: 1,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9._-]+$',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9._-]+$/, { message: 'Filename contains invalid characters' })
  filename!: string;

  @ApiProperty({
    enum: ['stl', 'step', 'iges', 'dxf', 'dwg', 'pdf'],
    description: 'File type/extension for the upload',
    example: 'stl',
  })
  @IsEnum(['stl', 'step', 'iges', 'dxf', 'dwg', 'pdf'])
  type!: FileType;

  @ApiProperty({
    example: 1048576,
    description: 'File size in bytes (max 200MB)',
    minimum: 1,
    maximum: 209715200,
  })
  @IsInt()
  @Min(1)
  @Max(200 * 1024 * 1024) // 200MB
  size!: number;
}

export class PresignedUploadResponseDto {
  @ApiProperty({
    description: 'Unique file identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  fileId!: string;

  @ApiProperty({
    description: 'Presigned URL for uploading the file',
    example:
      'https://s3.amazonaws.com/bucket/files/123e4567.stl?X-Amz-Algorithm=AWS4-HMAC-SHA256&...',
  })
  uploadUrl!: string;

  @ApiProperty({
    description: 'HTTP method to use for upload',
    example: 'PUT',
  })
  method!: string;

  @ApiProperty({
    description: 'Headers to include in the upload request',
    example: {
      'Content-Type': 'model/stl',
      'x-amz-server-side-encryption': 'AES256',
    },
  })
  headers!: Record<string, string>;

  @ApiProperty({
    description: 'URL expiration timestamp',
    example: '2024-01-01T01:00:00.000Z',
  })
  expiresAt!: Date;
}
