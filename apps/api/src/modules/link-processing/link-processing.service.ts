import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RedisService } from '../redis/redis.service';
import { QuotesService } from '../quotes/quotes.service';
import { JobType } from '../jobs/interfaces/job.interface';
import { 
  AnalyzeLinkDto, 
  LinkAnalysisResponseDto, 
  AnalysisStatus,
  SourceType 
} from './dto/analyze-link.dto';
import { UserPersona, Currency } from '@cotiza/shared';
import { v4 as uuidv4 } from 'uuid';

interface LinkAnalysis {
  id: string;
  tenantId: string;
  userId: string;
  url: string;
  sourceType: SourceType;
  status: AnalysisStatus;
  progress: number;
  message?: string;
  estimatedCompletion?: Date;
  createdAt: Date;
  updatedAt: Date;
  content?: any;
  bom?: any;
  quotes?: any[];
  errors?: any[];
}

@Injectable()
export class LinkProcessingService {
  private readonly logger = new Logger(LinkProcessingService.name);
  
  constructor(
    private readonly redis: RedisService,
    @InjectQueue(JobType.LINK_ANALYSIS) private readonly linkAnalysisQueue: Queue,
    private readonly quotesService: QuotesService,
  ) {}

  async startAnalysis(
    tenantId: string,
    userId: string,
    dto: AnalyzeLinkDto
  ): Promise<LinkAnalysisResponseDto> {
    this.logger.log(`Starting link analysis for: ${dto.url}`);

    // Create initial analysis record
    const analysisId = uuidv4();
    const analysis: LinkAnalysis = {
      id: analysisId,
      tenantId,
      userId,
      url: dto.url,
      sourceType: SourceType.UNKNOWN, // Will be determined during processing
      status: AnalysisStatus.PENDING,
      progress: 0,
      message: 'Analysis queued',
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in Redis for fast access
    await this.storeAnalysis(analysis);

    // Queue processing job
    await this.linkAnalysisQueue.add({
      analysisId,
      tenantId,
      userId,
      url: dto.url,
      persona: dto.persona,
      preferences: dto.preferences,
    });

    return this.mapAnalysisToResponse(analysis);
  }


  async getAnalysis(tenantId: string, analysisId: string): Promise<LinkAnalysisResponseDto> {
    const analysis = await this.getStoredAnalysis(analysisId);
    
    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    // Verify tenant access (unless it's a guest analysis)
    if (tenantId !== 'guest' && analysis.tenantId !== tenantId) {
      throw new NotFoundException('Analysis not found');
    }

    return this.mapAnalysisToResponse(analysis);
  }

  async listAnalyses(
    _tenantId: string,
    _userId: string,
    filters: { status?: string; page: number; limit: number }
  ): Promise<{
    data: LinkAnalysisResponseDto[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    // Get all analyses for user from Redis
    // Note: This is a simplified implementation. In production, consider using a proper search index
    const keys: string[] = [];
    
    let analyses: LinkAnalysis[] = [];
    for (const key of keys) {
      const analysis = await this.redis.get(key);
      if (analysis && typeof analysis === 'string') {
        const parsed = JSON.parse(analysis);
        if (!filters.status || parsed.status === filters.status) {
          analyses.push(parsed);
        }
      }
    }

    // Sort by creation date (newest first)
    analyses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const total = analyses.length;
    const totalPages = Math.ceil(total / filters.limit);
    const startIndex = (filters.page - 1) * filters.limit;
    const paginatedAnalyses = analyses.slice(startIndex, startIndex + filters.limit);

    return {
      data: paginatedAnalyses.map(a => this.mapAnalysisToResponse(a)),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      },
    };
  }

  async convertToQuote(
    tenantId: string,
    userId: string,
    analysisId: string,
    selectedItems?: string[],
    persona?: string
  ): Promise<{ quoteId: string; message: string }> {
    const analysis = await this.getStoredAnalysis(analysisId);
    
    if (!analysis || analysis.tenantId !== tenantId || analysis.userId !== userId) {
      throw new NotFoundException('Analysis not found');
    }

    if (analysis.status !== AnalysisStatus.COMPLETED) {
      throw new BadRequestException('Analysis must be completed before converting to quote');
    }

    // Find the persona quote to use
    const personaEnum = persona as UserPersona || UserPersona.DIY_MAKER;
    const selectedQuote = analysis.quotes?.find(q => q.persona === personaEnum) || analysis.quotes?.[0];
    
    if (!selectedQuote) {
      throw new BadRequestException('No quote available for conversion');
    }

    // Filter items if specific ones were selected
    let itemsToQuote = selectedQuote.recommendations;
    if (selectedItems && selectedItems.length > 0) {
      itemsToQuote = selectedQuote.recommendations.filter(rec => 
        selectedItems.includes(rec.component.name)
      );
    }

    // Create formal quote using existing quote service
    const quote = await this.quotesService.create(tenantId, userId, {
      currency: Currency.USD, // Default currency
      objective: {
        cost: 0.7,
        lead: 0.2,
        green: 0.1,
      },
    });

    // Add items to the quote
    for (const recommendation of itemsToQuote) {
      if (recommendation.recommendedService) {
        // This is a manufacturing item - for now we'll create a placeholder file
        // In production, this would need proper file handling
        const placeholderFileId = 'placeholder-file-id';
        
        await this.quotesService.addItem(tenantId, quote.id, {
          fileId: placeholderFileId,
          name: recommendation.component.name,
          process: recommendation.recommendedService,
          quantity: recommendation.component.quantity,
          options: {
            material: recommendation.component.material,
            notes: `Converted from link analysis: ${analysis.url}`,
          },
        });
      }
      // Note: Standard purchase items would need a different handling mechanism
    }

    // Calculate the quote
    await this.quotesService.calculate(tenantId, quote.id, {});

    return {
      quoteId: quote.id,
      message: 'Quote created successfully from link analysis',
    };
  }

  async retryAnalysis(tenantId: string, analysisId: string): Promise<LinkAnalysisResponseDto> {
    const analysis = await this.getStoredAnalysis(analysisId);
    
    if (!analysis || analysis.tenantId !== tenantId) {
      throw new NotFoundException('Analysis not found');
    }

    if (analysis.status !== AnalysisStatus.FAILED) {
      throw new BadRequestException('Can only retry failed analyses');
    }

    // Reset the analysis status
    const updatedAnalysis = await this.updateAnalysis(analysisId, {
      status: AnalysisStatus.PENDING,
      progress: 0,
      message: 'Retrying analysis...',
      errors: undefined,
    });

    // Queue the job again
    await this.linkAnalysisQueue.add({
      analysisId,
      tenantId: analysis.tenantId,
      userId: analysis.userId,
      url: analysis.url,
    });

    return this.mapAnalysisToResponse(updatedAnalysis);
  }

  private async storeAnalysis(analysis: LinkAnalysis): Promise<void> {
    const key = this.getAnalysisKey(analysis.id);
    await this.redis.setex(key, 86400, JSON.stringify(analysis)); // 24 hour TTL
  }

  private async getStoredAnalysis(analysisId: string): Promise<LinkAnalysis | null> {
    const key = this.getAnalysisKey(analysisId);
    const stored = await this.redis.get(key);
    return (stored && typeof stored === 'string') ? JSON.parse(stored) : null;
  }

  private async updateAnalysis(
    analysisId: string, 
    updates: Partial<LinkAnalysis>
  ): Promise<LinkAnalysis> {
    const existing = await this.getStoredAnalysis(analysisId);
    if (!existing) {
      throw new NotFoundException('Analysis not found');
    }

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    await this.storeAnalysis(updated);
    return updated;
  }

  private getAnalysisKey(analysisId: string): string {
    return `link-analysis:${analysisId}`;
  }

  private mapAnalysisToResponse(analysis: LinkAnalysis): LinkAnalysisResponseDto {
    return {
      id: analysis.id,
      url: analysis.url,
      sourceType: analysis.sourceType,
      status: analysis.status,
      progress: analysis.progress,
      message: analysis.message,
      estimatedCompletion: analysis.estimatedCompletion,
      project: analysis.content,
      bom: analysis.bom,
      quotes: analysis.quotes,
      errors: analysis.errors,
    };
  }
}