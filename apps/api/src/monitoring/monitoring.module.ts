import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { CloudWatchService } from './cloudwatch.service';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './indicators/prisma.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { S3HealthIndicator } from './indicators/s3.health';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [
    CloudWatchService,
    PrismaHealthIndicator,
    RedisHealthIndicator,
    S3HealthIndicator,
    PrismaService,
  ],
  exports: [CloudWatchService],
})
export class MonitoringModule {}
