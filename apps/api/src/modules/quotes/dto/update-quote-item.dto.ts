import { IsUUID, IsOptional, IsString, IsInt, Min, Max, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQuoteItemDto {
  @ApiProperty({ description: 'Quote item ID' })
  @IsUUID()
  itemId!: string;

  @ApiPropertyOptional({ description: 'Material code' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ description: 'Quantity to manufacture' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Process-specific selections' })
  @IsOptional()
  @IsObject()
  selections?: Record<string, any>;
}
