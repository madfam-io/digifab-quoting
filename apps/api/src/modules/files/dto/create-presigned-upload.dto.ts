import { IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '@madfam/shared';

export class CreatePresignedUploadDto {
  @ApiProperty({ example: 'part123.stl' })
  @IsString()
  filename: string;

  @ApiProperty({ enum: ['stl', 'step', 'iges', 'dxf', 'dwg', 'pdf'] })
  @IsEnum(['stl', 'step', 'iges', 'dxf', 'dwg', 'pdf'])
  type: FileType;

  @ApiProperty({ example: 1048576, description: 'File size in bytes' })
  @IsInt()
  @Min(1)
  @Max(200 * 1024 * 1024) // 200MB
  size: number;
}