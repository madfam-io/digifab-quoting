import { IsObject, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AddQuoteItemDto } from './add-quote-item.dto';

class QuoteObjectiveDto {
  @ApiProperty({ example: 0.5, minimum: 0, maximum: 1 })
  cost!: number;

  @ApiProperty({ example: 0.3, minimum: 0, maximum: 1 })
  lead!: number;

  @ApiProperty({ example: 0.2, minimum: 0, maximum: 1 })
  green!: number;
}

export class CalculateQuoteDto {
  @ApiProperty({ required: false, type: QuoteObjectiveDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => QuoteObjectiveDto)
  objective?: QuoteObjectiveDto;

  @ApiProperty({ required: false, type: [AddQuoteItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddQuoteItemDto)
  items?: AddQuoteItemDto[];
}