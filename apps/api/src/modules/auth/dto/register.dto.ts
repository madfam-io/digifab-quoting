import { IsEmail, IsString, MinLength, IsOptional, IsUUID, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address (must be unique)',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'User password (minimum 6 characters)',
    minLength: 6,
    format: 'password',
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  lastName!: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Contact phone number (optional)',
    pattern: '^\+?[1-9]\d{1,14}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone must be a valid E.164 format' })
  phone?: string;

  @ApiProperty({
    example: 'ACME Corp',
    description: 'Company or organization name',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  company!: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Tenant ID for multi-tenant registration (UUID format)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Indicates successful registration',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Registration confirmation message',
    example: 'User registered successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Created user information',
  })
  user!: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    createdAt: Date;
  };
}
