import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUrl } from 'class-validator';

export class CreatePaymentSessionDto {
  @ApiProperty({
    description: 'Custom success URL (optional)',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  successUrl?: string;

  @ApiProperty({
    description: 'Custom cancel URL (optional)',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  cancelUrl?: string;
}
