import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
  ) {}
  @Get()
  @ApiOperation({ summary: 'Health check' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  async ready() {
    const checks = {
      database: false,
      redis: false,
    };

    // Check database
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      // Database not ready
    }

    // Check Redis
    try {
      checks.redis = this.redisService.isConnected();
    } catch (error) {
      // Redis not ready
    }

    const allReady = Object.values(checks).every(check => check === true);

    return {
      status: allReady ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with cache statistics' })
  async detailed() {
    const redisStats = this.redisService.getStatistics();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024,
        total: process.memoryUsage().heapTotal / 1024 / 1024,
        unit: 'MB',
      },
      cache: {
        connected: this.redisService.isConnected(),
        statistics: redisStats,
      },
    };

    return health;
  }
}