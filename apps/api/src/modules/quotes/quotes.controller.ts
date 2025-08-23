import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto, QuoteResponseDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { AddQuoteItemDto, QuoteItemResponseDto } from './dto/add-quote-item.dto';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { QuoteStatus } from '@madfam/shared';
import { Audit } from '../audit/audit.interceptor';
import { AuditAction, AuditEntity } from '../audit/audit.service';
import {
  ValidationErrorResponseDto,
  NotFoundResponseDto,
  UnauthorizedResponseDto,
} from '../../common/dto/api-response.dto';
import { AuthenticatedRequest } from '../../types/auth-request';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';

@ApiTags('quotes')
@Controller('quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized - Invalid or missing JWT token',
  type: UnauthorizedResponseDto,
})
@ApiHeader({
  name: 'X-Tenant-ID',
  description: 'Tenant identifier for multi-tenant operations',
  required: false,
})
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new quote',
    description: 'Creates a new quote with specified currency and optimization objectives',
  })
  @ApiResponse({
    status: 201,
    description: 'Quote successfully created',
    type: QuoteResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    type: ValidationErrorResponseDto,
  })
  @Audit({
    entity: AuditEntity.QUOTE,
    action: AuditAction.CREATE,
    includeBody: true,
    includeResponse: true,
  })
  create(@Request() req: AuthenticatedRequest, @Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.create(req.user.tenantId, req.user.id, createQuoteDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List quotes',
    description: 'Retrieve a paginated list of quotes with optional filtering',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: QuoteStatus,
    description: 'Filter by quote status',
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter by customer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiPaginatedResponse(QuoteResponseDto)
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query() pagination: PaginationDto,
    @Query('status') status?: QuoteStatus,
    @Query('customerId') customerId?: string,
  ) {
    return this.quotesService.findAll(req.user.tenantId, {
      status,
      customerId,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get quote details',
    description: 'Retrieve detailed information about a specific quote',
  })
  @ApiParam({
    name: 'id',
    description: 'Quote ID',
    example: 'quote_123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote details',
    type: QuoteResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Quote not found',
    type: NotFoundResponseDto,
  })
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.quotesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quote' })
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(req.user.tenantId, id, updateQuoteDto);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add item to quote',
    description: 'Add a new part/item to an existing quote for pricing',
  })
  @ApiParam({
    name: 'id',
    description: 'Quote ID',
    example: 'quote_123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Item added successfully',
    type: QuoteItemResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Quote not found',
    type: NotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid item data or quote is not in draft status',
    type: ValidationErrorResponseDto,
  })
  addItem(
    @Request() req: AuthenticatedRequest,
    @Param('id') quoteId: string,
    @Body() addQuoteItemDto: AddQuoteItemDto,
  ) {
    return this.quotesService.addItem(req.user.tenantId, quoteId, addQuoteItemDto);
  }

  @Post(':id/calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate quote pricing',
    description: 'Triggers pricing calculation for all items in the quote based on objectives',
  })
  @ApiParam({
    name: 'id',
    description: 'Quote ID',
    example: 'quote_123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote calculation initiated',
    schema: {
      properties: {
        message: { type: 'string', example: 'Calculation started' },
        jobId: { type: 'string', example: 'job_123456' },
        estimatedTime: { type: 'number', example: 30 },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Quote not found',
    type: NotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Quote has no items or is already calculated',
    type: ValidationErrorResponseDto,
  })
  calculate(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() calculateQuoteDto: CalculateQuoteDto,
  ) {
    return this.quotesService.calculate(req.user.tenantId, id, calculateQuoteDto);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Customer approves quote',
    description: 'Customer accepts the quote and proceeds to order placement',
  })
  @ApiParam({
    name: 'id',
    description: 'Quote ID',
    example: 'quote_123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote approved successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Quote approved' },
        orderId: { type: 'string', example: 'order_123456' },
        paymentUrl: { type: 'string', example: 'https://payment.stripe.com/...' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Quote not found',
    type: NotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Quote is not in ready status or has expired',
    type: ValidationErrorResponseDto,
  })
  approve(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.quotesService.approve(req.user.tenantId, id, req.user.id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel quote' })
  cancel(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.quotesService.cancel(req.user.tenantId, id);
  }

  @Get(':id/pdf')
  @ApiOperation({
    summary: 'Generate quote PDF',
    description: 'Generate and return a PDF version of the quote for download/sharing',
  })
  @ApiParam({
    name: 'id',
    description: 'Quote ID',
    example: 'quote_123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF URL returned',
    schema: {
      properties: {
        url: {
          type: 'string',
          example: 'https://s3.amazonaws.com/quotes/quote_123.pdf',
          description: 'Presigned URL for PDF download (valid for 1 hour)',
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T01:00:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Quote not found',
    type: NotFoundResponseDto,
  })
  async generatePdf(@Request() _req: AuthenticatedRequest, @Param('id') _id: string) {
    // TODO: Implement PDF generation
    return {
      url: 'https://example.com/quote.pdf',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
  }
}
