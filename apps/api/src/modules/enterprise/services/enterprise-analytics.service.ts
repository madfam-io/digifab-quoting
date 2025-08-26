import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/modules/redis/redis.service';
import { UsageTrackingService, UsageEventType } from '../../billing/services/usage-tracking.service';

export interface EnterpriseAnalytics {
  tenantId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalQuotes: number;
    acceptedQuotes: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  usage: {
    apiCalls: number;
    storageUsed: number; // in GB
    computeHours: number;
    quotesGenerated: number;
    filesProcessed: number;
  };
  performance: {
    averageQuoteTime: number; // in seconds
    successRate: number;
    uptimePercentage: number;
    errorRate: number;
  };
  trends: {
    userGrowth: Array<{ date: string; value: number }>;
    revenueGrowth: Array<{ date: string; value: number }>;
    usageGrowth: Array<{ date: string; value: number }>;
  };
}

export interface UserAnalytics {
  tenantId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    retainedUsers: number;
    churnedUsers: number;
    averageSessionDuration: number;
  };
  usersByRole: Record<string, number>;
  usersByActivity: {
    highlyActive: number; // >10 sessions/month
    moderatelyActive: number; // 3-10 sessions/month
    lowActive: number; // 1-2 sessions/month
    inactive: number; // 0 sessions/month
  };
  retention: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  };
  cohortAnalysis: Array<{
    cohort: string;
    totalUsers: number;
    retainedUsers: Array<{ period: number; users: number; percentage: number }>;
  }>;
}

export interface UsageAnalytics {
  tenantId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  overview: {
    totalApiCalls: number;
    totalQuotes: number;
    totalStorage: number;
    totalComputeHours: number;
    peakConcurrency: number;
  };
  breakdown: Record<UsageEventType, {
    count: number;
    trend: number; // percentage change from previous period
    cost: number;
  }>;
  patterns: {
    hourlyDistribution: Array<{ hour: number; usage: number }>;
    dailyDistribution: Array<{ day: string; usage: number }>;
    weeklyDistribution: Array<{ week: string; usage: number }>;
  };
  limits: {
    quotaUtilization: Record<UsageEventType, {
      used: number;
      limit: number;
      percentage: number;
    }>;
    approaching: UsageEventType[];
    exceeded: UsageEventType[];
  };
  forecasting: {
    projected30Day: Record<UsageEventType, number>;
    estimatedCost: number;
    recommendedPlan: string;
  };
}

@Injectable()
export class EnterpriseAnalyticsService {
  private readonly logger = new Logger(EnterpriseAnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly usageTracking: UsageTrackingService,
  ) {}

  async getEnterpriseAnalytics(tenantId: string, period?: string): Promise<EnterpriseAnalytics> {
    const { startDate, endDate } = this.getPeriodDates(period || 'month');

    const [overview, usage, performance, trends] = await Promise.all([
      this.getOverviewMetrics(tenantId, startDate, endDate),
      this.getUsageMetrics(tenantId, startDate, endDate),
      this.getPerformanceMetrics(tenantId, startDate, endDate),
      this.getTrendMetrics(tenantId, startDate, endDate),
    ]);

    return {
      tenantId,
      period: { startDate, endDate },
      overview,
      usage,
      performance,
      trends,
    };
  }

  async getUserAnalytics(tenantId: string, period: string): Promise<UserAnalytics> {
    const { startDate, endDate } = this.getPeriodDates(period);

    const [metrics, usersByRole, usersByActivity, retention, cohortAnalysis] = await Promise.all([
      this.getUserMetrics(tenantId, startDate, endDate),
      this.getUsersByRole(tenantId),
      this.getUsersByActivity(tenantId, startDate, endDate),
      this.getRetentionMetrics(tenantId),
      this.getCohortAnalysis(tenantId, startDate, endDate),
    ]);

    return {
      tenantId,
      period: { startDate, endDate },
      metrics,
      usersByRole,
      usersByActivity,
      retention,
      cohortAnalysis,
    };
  }

  async getUsageAnalytics(tenantId: string, period: string): Promise<UsageAnalytics> {
    const { startDate, endDate } = this.getPeriodDates(period);

    const [overview, breakdown, patterns, limits, forecasting] = await Promise.all([
      this.getUsageOverview(tenantId, startDate, endDate),
      this.getUsageBreakdown(tenantId, startDate, endDate),
      this.getUsagePatterns(tenantId, startDate, endDate),
      this.getUsageLimits(tenantId),
      this.getUsageForecasting(tenantId),
    ]);

    return {
      tenantId,
      period: { startDate, endDate },
      overview,
      breakdown,
      patterns,
      limits,
      forecasting,
    };
  }

  async getRealtimeMetrics(tenantId: string): Promise<{
    activeUsers: number;
    currentApiRate: number; // requests per minute
    systemLoad: number;
    errorRate: number;
    averageResponseTime: number;
  }> {
    const [activeUsers, apiRate, systemLoad, errorRate, responseTime] = await Promise.all([
      this.getActiveUserCount(tenantId),
      this.getCurrentApiRate(tenantId),
      this.getSystemLoad(tenantId),
      this.getCurrentErrorRate(tenantId),
      this.getAverageResponseTime(tenantId),
    ]);

    return {
      activeUsers,
      currentApiRate: apiRate,
      systemLoad,
      errorRate,
      averageResponseTime: responseTime,
    };
  }

  async generateCustomReport(tenantId: string, config: {
    metrics: string[];
    period: string;
    granularity: 'hour' | 'day' | 'week' | 'month';
    filters?: Record<string, any>;
  }): Promise<any> {
    const { startDate, endDate } = this.getPeriodDates(config.period);
    const results: any = {};

    for (const metric of config.metrics) {
      switch (metric) {
        case 'user_growth':
          results.userGrowth = await this.getUserGrowthTrend(tenantId, startDate, endDate, config.granularity);
          break;
        case 'revenue':
          results.revenue = await this.getRevenueTrend(tenantId, startDate, endDate, config.granularity);
          break;
        case 'usage':
          results.usage = await this.getUsageTrend(tenantId, startDate, endDate, config.granularity);
          break;
        case 'performance':
          results.performance = await this.getPerformanceTrend(tenantId, startDate, endDate, config.granularity);
          break;
        default:
          this.logger.warn(`Unknown metric requested: ${metric}`);
      }
    }

    return {
      tenantId,
      period: { startDate, endDate },
      granularity: config.granularity,
      data: results,
      generatedAt: new Date(),
    };
  }

  private async getOverviewMetrics(tenantId: string, startDate: Date, endDate: Date): Promise<EnterpriseAnalytics['overview']> {
    const [users, quotes, payments] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId },
        select: {
          id: true,
          createdAt: true,
          lastLogin: true,
        },
      }),
      this.prisma.quote.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          id: true,
          status: true,
          totalPrice: true,
        },
      }),
      this.prisma.payment.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
          status: 'completed',
        },
        select: {
          amount: true,
        },
      }),
    ]);

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.lastLogin && u.lastLogin >= startDate).length;
    const totalQuotes = quotes.length;
    const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const averageOrderValue = payments.length > 0 ? totalRevenue / payments.length : 0;
    const conversionRate = totalQuotes > 0 ? acceptedQuotes / totalQuotes : 0;

    return {
      totalUsers,
      activeUsers,
      totalQuotes,
      acceptedQuotes,
      totalRevenue,
      averageOrderValue,
      conversionRate,
    };
  }

  private async getUsageMetrics(tenantId: string, startDate: Date, endDate: Date): Promise<EnterpriseAnalytics['usage']> {
    const usage = await this.usageTracking.getTenantUsage(tenantId, startDate, endDate);

    return {
      apiCalls: usage[UsageEventType.API_CALL] || 0,
      storageUsed: (usage[UsageEventType.STORAGE_GB_HOUR] || 0) / 24 / 30, // Convert GB-hours to GB average
      computeHours: (usage[UsageEventType.COMPUTE_SECONDS] || 0) / 3600, // Convert to hours
      quotesGenerated: usage[UsageEventType.QUOTE_GENERATION] || 0,
      filesProcessed: usage[UsageEventType.FILE_ANALYSIS] || 0,
    };
  }

  private async getPerformanceMetrics(tenantId: string, startDate: Date, endDate: Date): Promise<EnterpriseAnalytics['performance']> {
    // Mock implementation - would integrate with APM tools
    return {
      averageQuoteTime: 45.2,
      successRate: 0.997,
      uptimePercentage: 99.95,
      errorRate: 0.003,
    };
  }

  private async getTrendMetrics(tenantId: string, startDate: Date, endDate: Date): Promise<EnterpriseAnalytics['trends']> {
    const [userGrowth, revenueGrowth, usageGrowth] = await Promise.all([
      this.getUserGrowthTrend(tenantId, startDate, endDate, 'day'),
      this.getRevenueTrend(tenantId, startDate, endDate, 'day'),
      this.getUsageTrend(tenantId, startDate, endDate, 'day'),
    ]);

    return {
      userGrowth,
      revenueGrowth,
      usageGrowth,
    };
  }

  private async getUserMetrics(tenantId: string, startDate: Date, endDate: Date): Promise<UserAnalytics['metrics']> {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        createdAt: true,
        lastLogin: true,
        active: true,
      },
    });

    const totalUsers = users.length;
    const newUsers = users.filter(u => u.createdAt >= startDate && u.createdAt <= endDate).length;
    const activeUsers = users.filter(u => u.active && u.lastLogin && u.lastLogin >= startDate).length;
    
    // Mock retention/churn calculations
    const retainedUsers = Math.floor(activeUsers * 0.85);
    const churnedUsers = totalUsers - retainedUsers;

    return {
      totalUsers,
      newUsers,
      activeUsers,
      retainedUsers,
      churnedUsers,
      averageSessionDuration: 1800, // 30 minutes
    };
  }

  private async getUsersByRole(tenantId: string): Promise<Record<string, number>> {
    const users = await this.prisma.user.groupBy({
      by: ['role'],
      where: { tenantId, active: true },
      _count: { role: true },
    });

    return users.reduce((acc, group) => {
      acc[group.role] = group._count.role;
      return acc;
    }, {} as Record<string, number>);
  }

  private async getUsersByActivity(tenantId: string, startDate: Date, endDate: Date): Promise<UserAnalytics['usersByActivity']> {
    // Mock implementation - would track actual user sessions
    const totalUsers = await this.prisma.user.count({ where: { tenantId, active: true } });
    
    return {
      highlyActive: Math.floor(totalUsers * 0.15),
      moderatelyActive: Math.floor(totalUsers * 0.35),
      lowActive: Math.floor(totalUsers * 0.30),
      inactive: Math.floor(totalUsers * 0.20),
    };
  }

  private async getRetentionMetrics(tenantId: string): Promise<UserAnalytics['retention']> {
    // Mock implementation - would calculate actual retention rates
    return {
      day1: 0.95,
      day7: 0.78,
      day30: 0.65,
      day90: 0.48,
    };
  }

  private async getCohortAnalysis(tenantId: string, startDate: Date, endDate: Date): Promise<UserAnalytics['cohortAnalysis']> {
    // Mock implementation - would perform actual cohort analysis
    return [
      {
        cohort: '2024-01',
        totalUsers: 150,
        retainedUsers: [
          { period: 1, users: 142, percentage: 94.7 },
          { period: 7, users: 118, percentage: 78.7 },
          { period: 30, users: 98, percentage: 65.3 },
        ],
      },
    ];
  }

  private async getUsageOverview(tenantId: string, startDate: Date, endDate: Date): Promise<UsageAnalytics['overview']> {
    const usage = await this.usageTracking.getTenantUsage(tenantId, startDate, endDate);

    return {
      totalApiCalls: usage[UsageEventType.API_CALL] || 0,
      totalQuotes: usage[UsageEventType.QUOTE_GENERATION] || 0,
      totalStorage: usage[UsageEventType.STORAGE_GB_HOUR] || 0,
      totalComputeHours: usage[UsageEventType.COMPUTE_SECONDS] || 0,
      peakConcurrency: 45, // Mock value
    };
  }

  private async getUsageBreakdown(tenantId: string, startDate: Date, endDate: Date): Promise<UsageAnalytics['breakdown']> {
    const usage = await this.usageTracking.getTenantUsage(tenantId, startDate, endDate);
    const previousUsage = await this.usageTracking.getTenantUsage(
      tenantId,
      new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
      startDate
    );

    const breakdown: UsageAnalytics['breakdown'] = {};

    for (const eventType of Object.values(UsageEventType)) {
      const current = usage[eventType] || 0;
      const previous = previousUsage[eventType] || 0;
      const trend = previous > 0 ? ((current - previous) / previous) * 100 : 0;

      breakdown[eventType] = {
        count: current,
        trend,
        cost: this.calculateUsageCost(eventType, current),
      };
    }

    return breakdown;
  }

  private async getUsagePatterns(tenantId: string, startDate: Date, endDate: Date): Promise<UsageAnalytics['patterns']> {
    // Mock implementation - would analyze actual usage patterns
    return {
      hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        usage: Math.floor(Math.random() * 100) + 20,
      })),
      dailyDistribution: [],
      weeklyDistribution: [],
    };
  }

  private async getUsageLimits(tenantId: string): Promise<UsageAnalytics['limits']> {
    const currentUsage = await this.usageTracking.getCurrentMonthUsage(tenantId);
    const limits = await this.usageTracking.getTenantLimits(tenantId);

    const quotaUtilization: UsageAnalytics['limits']['quotaUtilization'] = {};
    const approaching: UsageEventType[] = [];
    const exceeded: UsageEventType[] = [];

    for (const [eventType, used] of Object.entries(currentUsage)) {
      const limit = limits[eventType as UsageEventType] || 0;
      const percentage = limit > 0 ? (used / limit) * 100 : 0;

      quotaUtilization[eventType as UsageEventType] = {
        used,
        limit,
        percentage,
      };

      if (percentage >= 100) {
        exceeded.push(eventType as UsageEventType);
      } else if (percentage >= 80) {
        approaching.push(eventType as UsageEventType);
      }
    }

    return {
      quotaUtilization,
      approaching,
      exceeded,
    };
  }

  private async getUsageForecasting(tenantId: string): Promise<UsageAnalytics['forecasting']> {
    // Mock implementation - would use ML/statistical models for forecasting
    const currentUsage = await this.usageTracking.getCurrentMonthUsage(tenantId);
    
    const projected30Day: Record<UsageEventType, number> = {};
    let estimatedCost = 0;

    for (const [eventType, used] of Object.entries(currentUsage)) {
      const projected = Math.floor(used * 1.15); // 15% growth assumption
      projected30Day[eventType as UsageEventType] = projected;
      estimatedCost += this.calculateUsageCost(eventType as UsageEventType, projected);
    }

    return {
      projected30Day,
      estimatedCost,
      recommendedPlan: estimatedCost > 500 ? 'enterprise' : 'pro',
    };
  }

  private calculateUsageCost(eventType: UsageEventType, usage: number): number {
    // Mock pricing - would use actual pricing service
    const prices: Record<UsageEventType, number> = {
      [UsageEventType.API_CALL]: 0.001,
      [UsageEventType.QUOTE_GENERATION]: 0.10,
      [UsageEventType.FILE_ANALYSIS]: 0.05,
      [UsageEventType.DFM_REPORT]: 0.25,
      [UsageEventType.PDF_GENERATION]: 0.02,
      [UsageEventType.STORAGE_GB_HOUR]: 0.023,
      [UsageEventType.COMPUTE_SECONDS]: 0.0001,
    };

    return (prices[eventType] || 0) * usage;
  }

  private getPeriodDates(period: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = new Date(now);
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    return { startDate, endDate };
  }

  private async getUserGrowthTrend(tenantId: string, startDate: Date, endDate: Date, granularity: string): Promise<Array<{ date: string; value: number }>> {
    // Mock implementation - would calculate actual user growth
    return [];
  }

  private async getRevenueTrend(tenantId: string, startDate: Date, endDate: Date, granularity: string): Promise<Array<{ date: string; value: number }>> {
    // Mock implementation - would calculate actual revenue trend
    return [];
  }

  private async getUsageTrend(tenantId: string, startDate: Date, endDate: Date, granularity: string): Promise<Array<{ date: string; value: number }>> {
    // Mock implementation - would calculate actual usage trend
    return [];
  }

  private async getPerformanceTrend(tenantId: string, startDate: Date, endDate: Date, granularity: string): Promise<Array<{ date: string; value: number }>> {
    // Mock implementation - would calculate actual performance trend
    return [];
  }

  private async getActiveUserCount(tenantId: string): Promise<number> {
    // Mock implementation - would use real-time session tracking
    return 42;
  }

  private async getCurrentApiRate(tenantId: string): Promise<number> {
    // Mock implementation - would calculate from Redis metrics
    return 125.5;
  }

  private async getSystemLoad(tenantId: string): Promise<number> {
    // Mock implementation - would get from infrastructure monitoring
    return 0.65;
  }

  private async getCurrentErrorRate(tenantId: string): Promise<number> {
    // Mock implementation - would calculate from error tracking
    return 0.002;
  }

  private async getAverageResponseTime(tenantId: string): Promise<number> {
    // Mock implementation - would get from APM tools
    return 245.8;
  }
}