import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProcessType } from '@madfam/shared';

@ApiTags('pricing')
@Controller('pricing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('materials')
  @ApiOperation({ summary: 'Get available materials' })
  @ApiQuery({ name: 'process', required: false, enum: ProcessType })
  getMaterials(
    @Request() req,
    @Query('process') process?: ProcessType,
  ) {
    return this.pricingService.getMaterials(req.user.tenantId, process);
  }

  @Get('machines')
  @ApiOperation({ summary: 'Get available machines' })
  @ApiQuery({ name: 'process', required: false, enum: ProcessType })
  getMachines(
    @Request() req,
    @Query('process') process?: ProcessType,
  ) {
    return this.pricingService.getMachines(req.user.tenantId, process);
  }

  @Get('process-options')
  @ApiOperation({ summary: 'Get process options and constraints' })
  @ApiQuery({ name: 'process', required: false, enum: ProcessType })
  getProcessOptions(
    @Request() req,
    @Query('process') process?: ProcessType,
  ) {
    return this.pricingService.getProcessOptions(req.user.tenantId, process);
  }
}