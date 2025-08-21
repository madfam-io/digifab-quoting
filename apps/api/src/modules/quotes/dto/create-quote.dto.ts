import { IsEnum, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '@madfam/shared';

class QuoteObjectiveDto {
  @ApiProperty({ example: 0.5, minimum: 0, maximum: 1 })
  cost: number;

  @ApiProperty({ example: 0.3, minimum: 0, maximum: 1 })
  lead: number;

  @ApiProperty({ example: 0.2, minimum: 0, maximum: 1 })
  green: number;
}

export class CreateQuoteDto {
  @ApiProperty({ enum: ['MXN', 'USD'], default: 'MXN' })
  @IsEnum(['MXN', 'USD'])
  currency: Currency;

  @ApiProperty({ type: QuoteObjectiveDto })
  @IsObject()
  @ValidateNested()
  @Type(() => QuoteObjectiveDto)
  objective: QuoteObjectiveDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}