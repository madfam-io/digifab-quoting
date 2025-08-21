import { IsString, IsEnum, IsInt, IsObject, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProcessType } from '@madfam/shared';

export class AddQuoteItemDto {
  @ApiProperty()
  @IsUUID()
  fileId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ enum: ['3d_fff', '3d_sla', 'cnc_3axis', 'laser_2d'] })
  @IsEnum(['3d_fff', '3d_sla', 'cnc_3axis', 'laser_2d'])
  process: ProcessType;

  @ApiProperty({ minimum: 1, maximum: 10000 })
  @IsInt()
  @Min(1)
  @Max(10000)
  quantity: number;

  @ApiProperty({ type: 'object' })
  @IsObject()
  options: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requiredBy?: string;
}