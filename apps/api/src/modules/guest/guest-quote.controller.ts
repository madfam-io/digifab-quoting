import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { GuestQuoteService } from './guest-quote.service';
import { GuestSessionMiddleware, GuestSessionRequest } from './guest-session.middleware';
import { FilesService } from '../files/files.service';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateGuestQuote,
  UpdateGuestQuoteItem,
  GuestQuote,
} from '@madfam/shared';

@ApiTags('Guest Quotes')
@Controller('api/v1/guest/quotes')
export class GuestQuoteController {
  constructor(
    private readonly guestQuoteService: GuestQuoteService,
    private readonly filesService: FilesService,
  ) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload files for guest quote' })
  @ApiResponse({ status: 200, description: 'Files uploaded successfully' })
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: GuestSessionRequest,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const sessionId = req.guestSession?.id;
    if (!sessionId) {
      throw new BadRequestException('Invalid session');
    }

    // For demo purposes, create mock upload results
    // In production, this would upload to S3
    const uploadResults = files.map(file => ({
      uploadId: uuidv4(),
      key: `guest/${sessionId}/${file.originalname}`,
      filename: file.originalname,
      size: file.size,
      url: `https://s3.amazonaws.com/demo-bucket/guest/${sessionId}/${file.originalname}`,
    }));

    return {
      uploadId: uploadResults[0].uploadId,
      files: uploadResults.map(result => ({
        key: result.key,
        filename: result.filename,
        size: result.size,
        url: result.url,
      })),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a guest quote' })
  @ApiResponse({ status: 201, description: 'Quote created successfully' })
  async createQuote(
    @Body() createDto: CreateGuestQuote,
    @Req() req: GuestSessionRequest,
  ): Promise<GuestQuote> {
    const sessionId = req.guestSession?.id;
    if (!sessionId) {
      throw new BadRequestException('Invalid session');
    }

    return this.guestQuoteService.createQuote(sessionId, createDto);
  }

  @Get(':quoteId')
  @ApiOperation({ summary: 'Get guest quote details' })
  @ApiResponse({ status: 200, description: 'Quote details' })
  async getQuote(
    @Param('quoteId') quoteId: string,
    @Req() req: GuestSessionRequest,
  ): Promise<GuestQuote> {
    const sessionId = req.guestSession?.id;
    if (!sessionId) {
      throw new BadRequestException('Invalid session');
    }

    return this.guestQuoteService.getQuote(sessionId, quoteId);
  }

  @Get()
  @ApiOperation({ summary: 'List all guest quotes for session' })
  @ApiResponse({ status: 200, description: 'List of quotes' })
  async listQuotes(
    @Req() req: GuestSessionRequest,
  ): Promise<GuestQuote[]> {
    const sessionId = req.guestSession?.id;
    if (!sessionId) {
      throw new BadRequestException('Invalid session');
    }

    return this.guestQuoteService.listSessionQuotes(sessionId);
  }

  @Patch(':quoteId/items/:itemIndex')
  @ApiOperation({ summary: 'Update guest quote item' })
  @ApiResponse({ status: 200, description: 'Quote updated successfully' })
  async updateQuoteItem(
    @Param('quoteId') quoteId: string,
    @Param('itemIndex') itemIndex: string,
    @Body() updateDto: UpdateGuestQuoteItem,
    @Req() req: GuestSessionRequest,
  ): Promise<GuestQuote> {
    const sessionId = req.guestSession?.id;
    if (!sessionId) {
      throw new BadRequestException('Invalid session');
    }

    const index = parseInt(itemIndex, 10);
    if (isNaN(index) || index < 0) {
      throw new BadRequestException('Invalid item index');
    }

    return this.guestQuoteService.updateQuoteItem(
      sessionId,
      quoteId,
      index,
      updateDto
    );
  }

  @Get('session/metrics')
  @ApiOperation({ summary: 'Get guest session metrics' })
  @ApiResponse({ status: 200, description: 'Session metrics' })
  async getSessionMetrics(@Req() req: GuestSessionRequest) {
    const sessionToken = req.guestSession?.token;
    if (!sessionToken) {
      throw new BadRequestException('Invalid session');
    }

    const middleware = new GuestSessionMiddleware(
      this.guestQuoteService['redis'],
      this.guestQuoteService['config']
    );

    return middleware.getSessionMetrics(sessionToken);
  }
}