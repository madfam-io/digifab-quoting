import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmUploadDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  ndaAcceptanceId?: string;
}