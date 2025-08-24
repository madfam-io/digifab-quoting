import { IsArray, IsUUID, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ShippingAddressDto {
  @ApiProperty({ description: 'Address line 1' })
  @IsString()
  @MaxLength(100)
  line1!: string;

  @ApiPropertyOptional({ description: 'Address line 2' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  line2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @MaxLength(50)
  city!: string;

  @ApiProperty({ description: 'State/Province' })
  @IsString()
  @MaxLength(50)
  state!: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  @MaxLength(20)
  postalCode!: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)' })
  @IsString()
  @MaxLength(2)
  country!: string;
}

export class AcceptQuoteDto {
  @ApiProperty({
    description: 'IDs of quote items to accept',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  acceptedItems!: string[];

  @ApiProperty({ description: 'Shipping address' })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress!: ShippingAddressDto;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
