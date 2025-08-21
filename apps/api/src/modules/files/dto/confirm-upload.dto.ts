import { IsUUID, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmUploadDto {
  @ApiPropertyOptional({ 
    description: 'NDA acceptance ID if file contains confidential information',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsOptional()
  @IsUUID()
  ndaAcceptanceId?: string;
}