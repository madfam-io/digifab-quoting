import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { AddQuoteItemDto } from './dto/add-quote-item.dto';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { QuoteStatus } from '@madfam/shared';

@ApiTags('quotes')
@Controller('quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new quote' })
  @ApiResponse({ status: 201, description: 'Quote created' })
  create(@Request() req, @Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.create(
      req.user.tenantId,
      req.user.id,
      createQuoteDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List quotes' })
  @ApiQuery({ name: 'status', required: false, enum: QuoteStatus })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  findAll(
    @Request() req,
    @Query('status') status?: QuoteStatus,
    @Query('customerId') customerId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.quotesService.findAll(req.user.tenantId, {
      status,
      customerId,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote details' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.quotesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quote' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(req.user.tenantId, id, updateQuoteDto);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to quote' })
  addItem(
    @Request() req,
    @Param('id') quoteId: string,
    @Body() addQuoteItemDto: AddQuoteItemDto,
  ) {
    return this.quotesService.addItem(
      req.user.tenantId,
      quoteId,
      addQuoteItemDto,
    );
  }

  @Post(':id/calculate')
  @ApiOperation({ summary: 'Calculate quote pricing' })
  @ApiResponse({ status: 200, description: 'Quote calculated' })
  calculate(
    @Request() req,
    @Param('id') id: string,
    @Body() calculateQuoteDto: CalculateQuoteDto,
  ) {
    return this.quotesService.calculate(
      req.user.tenantId,
      id,
      calculateQuoteDto,
    );
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer approves quote' })
  approve(@Request() req, @Param('id') id: string) {
    return this.quotesService.approve(req.user.tenantId, id, req.user.id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel quote' })
  cancel(@Request() req, @Param('id') id: string) {
    return this.quotesService.cancel(req.user.tenantId, id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate quote PDF' })
  @ApiResponse({ status: 200, description: 'PDF URL returned' })
  async generatePdf(@Request() req, @Param('id') id: string) {
    // TODO: Implement PDF generation
    return { url: 'https://example.com/quote.pdf' };
  }
}