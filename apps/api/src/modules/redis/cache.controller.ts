import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiForbiddenResponse, ApiHeader } from '@nestjs/swagger';
import { CacheService } from './cache.service';
import { RedisService } from './redis.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { Role } from '@madfam/shared';
import { ForbiddenResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('cache')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cache')
@ApiHeader({
  name: 'X-Tenant-ID',
  description: 'Tenant identifier for multi-tenant operations',
  required: false
})
@ApiForbiddenResponse({ 
  description: 'Insufficient permissions',
  type: ForbiddenResponseDto 
})
export class CacheController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly redisService: RedisService,
  ) {}

  @Get('health')
  @ApiOperation({ 
    summary: 'Get cache health status',
    description: 'Check Redis connection status and cache system health' 
  })
  @ApiResponse({
    status: 200,
    description: 'Cache health status',
    schema: {
      properties: {
        status: { 
          type: 'string', 
          enum: ['healthy', 'degraded', 'unhealthy'],
          example: 'healthy' 
        },
        redis: {
          type: 'object',
          properties: {
            connected: { type: 'boolean', example: true },
            latency: { type: 'number', example: 2.5, description: 'Latency in milliseconds' },
            memory: {
              type: 'object',
              properties: {
                used: { type: 'number', example: 52428800 },
                peak: { type: 'number', example: 104857600 },
                fragmentation: { type: 'number', example: 1.2 }
              }
            },
            version: { type: 'string', example: '7.0.5' }
          }
        },
        uptime: { type: 'number', example: 86400, description: 'Uptime in seconds' },
        lastCheck: { type: 'string', format: 'date-time' }
      }
    }
  })
  @Roles(Role.ADMIN, Role.MANAGER)
  async getHealth() {
    return await this.cacheService.getHealthStatus();
  }

  @Get('statistics')
  @ApiOperation({ 
    summary: 'Get cache statistics',
    description: 'Retrieve detailed cache usage statistics including hit/miss ratios' 
  })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics',
    schema: {
      properties: {
        hits: { type: 'number', example: 1234, description: 'Total cache hits' },
        misses: { type: 'number', example: 456, description: 'Total cache misses' },
        hitRate: { type: 'number', example: 73.0, description: 'Hit rate percentage' },
        totalRequests: { type: 'number', example: 1690 },
        avgGetTime: { type: 'number', example: 0.5, description: 'Average GET time in ms' },
        avgSetTime: { type: 'number', example: 1.2, description: 'Average SET time in ms' },
        memoryUsage: { type: 'number', example: 52428800, description: 'Memory usage in bytes' },
        keyCount: { type: 'number', example: 789, description: 'Total number of keys' },
        evictions: { type: 'number', example: 12, description: 'Number of evicted keys' },
        connections: { type: 'number', example: 5, description: 'Active connections' },
        breakdown: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              hits: { type: 'number' },
              misses: { type: 'number' },
              hitRate: { type: 'number' }
            }
          },
          example: {
            'config:': { hits: 500, misses: 10, hitRate: 98.0 },
            'quote:': { hits: 300, misses: 100, hitRate: 75.0 },
            'file:': { hits: 434, misses: 346, hitRate: 55.6 }
          }
        },
        lastReset: { type: 'string', format: 'date-time' }
      }
    }
  })
  @Roles(Role.ADMIN, Role.MANAGER)
  getStatistics() {
    return this.redisService.getStatistics();
  }

  @Post('statistics/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reset cache statistics',
    description: 'Reset all cache statistics counters to zero. Admin only.' 
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics reset successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Statistics reset successfully' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  @Roles(Role.ADMIN)
  resetStatistics() {
    this.redisService.resetStatistics();
    return { 
      message: 'Statistics reset successfully',
      timestamp: new Date().toISOString()
    };
  }

  @Delete('invalidate/:pattern')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Invalidate cache by pattern',
    description: 'Delete all cache keys matching the specified pattern. Use with caution.' 
  })
  @ApiParam({ 
    name: 'pattern', 
    description: 'Redis key pattern (supports wildcards)',
    examples: {
      'all-quotes': { value: 'quote:*' },
      'specific-tenant': { value: 'tenant:123:*' },
      'config-cache': { value: 'config:*' }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Cache invalidated successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Cache invalidated successfully' },
        keysDeleted: { type: 'number', example: 42, description: 'Number of keys deleted' },
        pattern: { type: 'string', example: 'quote:*' }
      }
    }
  })
  @Roles(Role.ADMIN)
  async invalidatePattern(@Param('pattern') pattern: string) {
    const deleted = await this.cacheService.invalidate(pattern);
    return { 
      message: 'Cache invalidated successfully',
      keysDeleted: deleted,
      pattern
    };
  }

  @Delete('tenant')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Flush current tenant cache',
    description: 'Clear all cache entries for the current tenant context' 
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant cache flushed successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Tenant cache flushed successfully' },
        tenantId: { type: 'string', example: 'tenant_123' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  @Roles(Role.ADMIN)
  async flushTenantCache() {
    await this.cacheService.invalidateTenantConfig();
    return { 
      message: 'Tenant cache flushed successfully',
      timestamp: new Date().toISOString()
    };
  }

  @Post('warmup')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ 
    summary: 'Warm up cache with frequently accessed data',
    description: 'Pre-load cache with commonly accessed data to improve performance. This is an async operation.' 
  })
  @ApiResponse({
    status: 202,
    description: 'Cache warm-up initiated',
    schema: {
      properties: {
        message: { type: 'string', example: 'Cache warm-up initiated' },
        status: { type: 'string', example: 'processing' },
        estimatedTime: { type: 'number', example: 30, description: 'Estimated completion time in seconds' },
        items: {
          type: 'array',
          items: { type: 'string' },
          example: ['materials', 'machines', 'process-options', 'tenant-config']
        }
      }
    }
  })
  @Roles(Role.ADMIN)
  async warmUpCache() {
    await this.cacheService.warmUpCache();
    return { 
      message: 'Cache warm-up initiated',
      status: 'processing',
      estimatedTime: 30,
      items: ['materials', 'machines', 'process-options', 'tenant-config']
    };
  }
}