import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProcessType } from '@cotiza/shared';
import { UnauthorizedResponseDto } from '../../common/dto/api-response.dto';
import { AuthenticatedRequest } from '../../types/auth-request';

@ApiTags('pricing')
@Controller('pricing')
@UseGuards(JwtAuthGuard)
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
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('materials')
  @ApiOperation({
    summary: 'Get available materials',
    description: 'Retrieve list of materials available for a specific process or all processes',
  })
  @ApiQuery({
    name: 'process',
    required: false,
    enum: ['3d_fff', '3d_sla', 'cnc_3axis', 'laser_2d'],
    description: 'Filter materials by manufacturing process',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available materials',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'mat_pla_black' },
          name: { type: 'string', example: 'PLA - Black' },
          process: { type: 'string', example: '3d_fff' },
          category: { type: 'string', example: 'thermoplastic' },
          properties: {
            type: 'object',
            properties: {
              density: { type: 'number', example: 1.24 },
              tensileStrength: { type: 'number', example: 50 },
              flexuralModulus: { type: 'number', example: 2.3 },
              heatResistance: { type: 'number', example: 60 },
            },
          },
          costPerUnit: { type: 'number', example: 25.0 },
          unit: { type: 'string', example: 'kg' },
          minOrderQty: { type: 'number', example: 0.1 },
          leadTimeDays: { type: 'number', example: 0 },
          colors: {
            type: 'array',
            items: { type: 'string' },
            example: ['black', 'white', 'red', 'blue'],
          },
          finishes: {
            type: 'array',
            items: { type: 'string' },
            example: ['standard', 'smooth', 'matte'],
          },
          sustainable: { type: 'boolean', example: true },
          recyclable: { type: 'boolean', example: true },
        },
      },
    },
  })
  getMaterials(@Request() req: AuthenticatedRequest, @Query('process') process?: ProcessType) {
    return this.pricingService.getMaterials(req.user.tenantId, process);
  }

  @Get('machines')
  @ApiOperation({
    summary: 'Get available machines',
    description: 'Retrieve list of machines available for a specific process or all processes',
  })
  @ApiQuery({
    name: 'process',
    required: false,
    enum: ['3d_fff', '3d_sla', 'cnc_3axis', 'laser_2d'],
    description: 'Filter machines by manufacturing process',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available machines',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'machine_prusa_mk4' },
          name: { type: 'string', example: 'Prusa MK4' },
          process: { type: 'string', example: '3d_fff' },
          manufacturer: { type: 'string', example: 'Prusa Research' },
          model: { type: 'string', example: 'MK4' },
          buildVolume: {
            type: 'object',
            properties: {
              x: { type: 'number', example: 250 },
              y: { type: 'number', example: 210 },
              z: { type: 'number', example: 220 },
            },
          },
          resolution: {
            type: 'object',
            properties: {
              min: { type: 'number', example: 0.05 },
              max: { type: 'number', example: 0.3 },
              unit: { type: 'string', example: 'mm' },
            },
          },
          materials: {
            type: 'array',
            items: { type: 'string' },
            example: ['PLA', 'PETG', 'ABS', 'TPU'],
          },
          setupTime: { type: 'number', example: 15 },
          hourlyRate: { type: 'number', example: 50.0 },
          capabilities: {
            type: 'array',
            items: { type: 'string' },
            example: ['multi-material', 'auto-leveling', 'enclosed'],
          },
          maxPartSize: { type: 'number', example: 200 },
          tolerance: { type: 'number', example: 0.1 },
          availability: { type: 'string', example: 'available' },
        },
      },
    },
  })
  getMachines(@Request() req: AuthenticatedRequest, @Query('process') process?: ProcessType) {
    return this.pricingService.getMachines(req.user.tenantId, process);
  }

  @Get('process-options')
  @ApiOperation({
    summary: 'Get process options and constraints',
    description: 'Retrieve available options and constraints for each manufacturing process',
  })
  @ApiQuery({
    name: 'process',
    required: false,
    enum: ['3d_fff', '3d_sla', 'cnc_3axis', 'laser_2d'],
    description: 'Get options for specific process only',
  })
  @ApiResponse({
    status: 200,
    description: 'Process options and constraints',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          process: { type: 'string', example: '3d_fff' },
          name: { type: 'string', example: 'FFF/FDM 3D Printing' },
          description: { type: 'string', example: 'Fused Filament Fabrication' },
          options: {
            type: 'object',
            properties: {
              infillDensity: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'range' },
                  min: { type: 'number', example: 10 },
                  max: { type: 'number', example: 100 },
                  default: { type: 'number', example: 20 },
                  unit: { type: 'string', example: '%' },
                },
              },
              layerHeight: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'enum' },
                  values: {
                    type: 'array',
                    items: { type: 'number' },
                    example: [0.1, 0.15, 0.2, 0.3],
                  },
                  default: { type: 'number', example: 0.2 },
                  unit: { type: 'string', example: 'mm' },
                },
              },
              supportMaterial: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'boolean' },
                  default: { type: 'boolean', example: false },
                  costMultiplier: { type: 'number', example: 1.15 },
                },
              },
              wallThickness: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'range' },
                  min: { type: 'number', example: 0.8 },
                  max: { type: 'number', example: 5 },
                  default: { type: 'number', example: 1.2 },
                  unit: { type: 'string', example: 'mm' },
                },
              },
            },
          },
          constraints: {
            type: 'object',
            properties: {
              minWallThickness: { type: 'number', example: 0.8 },
              minFeatureSize: { type: 'number', example: 0.5 },
              maxOverhang: { type: 'number', example: 45 },
              maxBridgeLength: { type: 'number', example: 10 },
              requiresSupport: { type: 'boolean', example: true },
            },
          },
          postProcessing: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'sanding' },
                name: { type: 'string', example: 'Sanding' },
                description: { type: 'string', example: 'Manual sanding for smooth finish' },
                costMultiplier: { type: 'number', example: 1.2 },
                timeMultiplier: { type: 'number', example: 1.5 },
              },
            },
          },
        },
      },
    },
  })
  getProcessOptions(@Request() req: AuthenticatedRequest, @Query('process') process?: ProcessType) {
    return this.pricingService.getProcessOptions(req.user.tenantId, process);
  }
}
