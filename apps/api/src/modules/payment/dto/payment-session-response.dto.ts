import { ApiProperty } from '@nestjs/swagger';

export class PaymentSessionResponseDto {
  @ApiProperty({
    description: 'Stripe checkout session ID',
    example: 'cs_test_a1b2c3d4e5f6g7h8i9j0',
  })
  sessionId!: string;

  @ApiProperty({
    description: 'URL to redirect user for payment',
    example: 'https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6g7h8i9j0',
  })
  paymentUrl!: string;
}
