import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Indicates if the request was successful' })
  success!: boolean;

  @ApiProperty({ description: 'Response data', required: false })
  data?: T;

  @ApiProperty({ description: 'Error message if request failed', required: false })
  message?: string;

  @ApiProperty({ description: 'Additional error details', required: false })
  errors?: Record<string, unknown>;

  @ApiProperty({ description: 'Response timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  items!: T[];

  @ApiProperty({ description: 'Total number of items', example: 100 })
  total!: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Number of items per page', example: 20 })
  limit!: number;

  @ApiProperty({ description: 'Total number of pages', example: 5 })
  totalPages!: number;

  @ApiProperty({ description: 'Indicates if there is a next page' })
  hasNext!: boolean;

  @ApiProperty({ description: 'Indicates if there is a previous page' })
  hasPrev!: boolean;
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 400 })
  statusCode!: number;

  @ApiProperty({ description: 'Error message', example: 'Bad Request' })
  message!: string;

  @ApiProperty({ description: 'Detailed error information', required: false })
  error?: string;

  @ApiProperty({ description: 'Request path', example: '/api/v1/quotes' })
  path!: string;

  @ApiProperty({ description: 'Error timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ description: 'Request ID for tracking', example: 'req_123456' })
  requestId?: string;

  @ApiProperty({ description: 'Validation errors', required: false })
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;
}

export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Validation error details',
    example: [
      { field: 'email', message: 'Invalid email format' },
      { field: 'password', message: 'Password must be at least 8 characters' }
    ]
  })
  validationErrors!: Array<{
    field: string;
    message: string;
  }>;
}

export class UnauthorizedResponseDto {
  @ApiProperty({ example: 401 })
  statusCode!: number;

  @ApiProperty({ example: 'Unauthorized' })
  message!: string;

  @ApiProperty({ example: 'Invalid or expired token' })
  error!: string;
}

export class ForbiddenResponseDto {
  @ApiProperty({ example: 403 })
  statusCode!: number;

  @ApiProperty({ example: 'Forbidden' })
  message!: string;

  @ApiProperty({ example: 'Insufficient permissions' })
  error!: string;
}

export class NotFoundResponseDto {
  @ApiProperty({ example: 404 })
  statusCode!: number;

  @ApiProperty({ example: 'Not Found' })
  message!: string;

  @ApiProperty({ example: 'Resource not found' })
  error!: string;
}

export class ConflictResponseDto {
  @ApiProperty({ example: 409 })
  statusCode!: number;

  @ApiProperty({ example: 'Conflict' })
  message!: string;

  @ApiProperty({ example: 'Resource already exists' })
  error!: string;
}

export class InternalServerErrorResponseDto {
  @ApiProperty({ example: 500 })
  statusCode!: number;

  @ApiProperty({ example: 'Internal Server Error' })
  message!: string;

  @ApiProperty({ example: 'An unexpected error occurred' })
  error!: string;
}