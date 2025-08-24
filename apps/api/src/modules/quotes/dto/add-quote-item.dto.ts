import {
  IsString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsUUID,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProcessType } from '@madfam/shared';

export class AddQuoteItemDto {
  @ApiProperty({
    description: 'ID of the uploaded file to quote',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  fileId!: string;

  @ApiPropertyOptional({
    description: 'Custom name for the part/item',
    example: 'Custom Bracket v2',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    enum: ['3d_fff', '3d_sla', 'cnc_3axis', 'laser_2d'],
    description: 'Manufacturing process type',
    example: '3d_fff',
  })
  @IsEnum(['3d_fff', '3d_sla', 'cnc_3axis', 'laser_2d'])
  process!: ProcessType;

  @ApiProperty({
    minimum: 1,
    maximum: 10000,
    description: 'Quantity to manufacture',
    example: 10,
  })
  @IsInt()
  @Min(1)
  @Max(10000)
  quantity!: number;

  @ApiProperty({
    type: 'object',
    description: 'Process-specific options (material, finish, etc.)',
    example: {
      material: 'PLA',
      color: 'black',
      infill: 20,
      layerHeight: 0.2,
      supportMaterial: false,
    },
  })
  @IsObject()
  options!: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Required delivery date (ISO 8601 format)',
    example: '2024-02-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  requiredBy?: string;
}

export class QuoteItemResponseDto {
  @ApiProperty({
    description: 'Quote item ID',
    example: 'item_123e4567',
  })
  id!: string;

  @ApiProperty({
    description: 'Associated file ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  fileId!: string;

  @ApiProperty({
    description: 'Item name',
    example: 'Custom Bracket v2',
  })
  name!: string;

  @ApiProperty({
    description: 'Manufacturing process',
    example: '3d_fff',
  })
  process!: string;

  @ApiProperty({
    description: 'Quantity',
    example: 10,
  })
  quantity!: number;

  @ApiProperty({
    description: 'Unit price',
    example: 25.5,
  })
  unitPrice!: number;

  @ApiProperty({
    description: 'Total price for this item',
    example: 255.0,
  })
  totalPrice!: number;

  @ApiProperty({
    description: 'Estimated lead time in days',
    example: 3,
  })
  leadTimeDays!: number;

  @ApiProperty({
    description: 'Process options applied',
    example: { material: 'PLA', color: 'black' },
  })
  options!: Record<string, unknown>;
}
