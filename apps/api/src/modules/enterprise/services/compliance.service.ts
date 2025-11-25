import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/modules/redis/redis.service';
import { AuditTrailService } from './audit-trail.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as archiver from 'archiver';
// import * as csvWriter from 'csv-writer';

export interface AuditLogFilter {
  startDate?: Date;
  endDate?: Date;
  action?: string;
  user?: string;
  limit?: number;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  before: Record<string, any>;
  after: Record<string, any>;
  metadata: Record<string, any>;
  at: Date;
}

export interface DataRetentionPolicy {
  tenantId: string;
  auditLogRetentionDays: number;
  fileRetentionDays: number;
  inactiveUserRetentionDays: number;
  autoDeleteEnabled: boolean;
  lastEnforcedAt?: Date;
}

export interface ComplianceReport {
  tenantId: string;
  reportType: 'gdpr' | 'soc2' | 'iso27001' | 'custom';
  generatedAt: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: {
    totalUsers: number;
    activeUsers: number;
    dataProcessingEvents: number;
    securityIncidents: number;
    accessRequests: number;
    dataExports: number;
  };
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    remediation?: string;
  }>;
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly _redis: RedisService,
    private readonly _auditTrail: AuditTrailService,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.get<string>('S3_BUCKET', '');
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
    });
  }

  async getAuditLogs(tenantId: string, filter: AuditLogFilter): Promise<AuditLog[]> {
    const where: any = {
      tenantId,
    };

    if (filter.startDate) {
      where.at = { gte: filter.startDate };
    }

    if (filter.endDate) {
      where.at = { ...where.at, lte: filter.endDate };
    }

    if (filter.action) {
      where.action = { contains: filter.action, mode: 'insensitive' };
    }

    if (filter.user) {
      where.actorId = filter.user;
    }

    const auditLogs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { at: 'desc' },
      take: filter.limit || 100,
      include: {
        // user: {
        //   select: {
        //     id: true,
        //     email: true,
        //     name: true,
        //   }
        // }
      },
    });

    return auditLogs.map((log) => ({
      id: log.id,
      tenantId: log.tenantId,
      userId: log.actorId,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      before: log.before as Record<string, any>,
      after: log.after as Record<string, any>,
      metadata: log.metadata as Record<string, any>,
      at: log.at,
    }));
  }

  async initiateDataExport(tenantId: string, format: 'json' | 'csv'): Promise<string> {
    const exportId = `export-${tenantId}-${Date.now()}`;

    // Start async export process
    setImmediate(() => this.performDataExport(tenantId, exportId, format));

    this.logger.log(`Initiated data export for tenant ${tenantId}, format: ${format}`);

    return exportId;
  }

  async configureDataRetention(
    tenantId: string,
    policy: Omit<DataRetentionPolicy, 'tenantId'>,
  ): Promise<void> {
    await this.prisma.dataRetentionPolicy.upsert({
      where: { tenantId },
      update: {
        auditLogRetentionDays: policy.auditLogRetentionDays,
        fileRetentionDays: policy.fileRetentionDays,
        inactiveUserRetentionDays: policy.inactiveUserRetentionDays,
        autoDeleteEnabled: policy.autoDeleteEnabled,
      },
      create: {
        tenantId,
        auditLogRetentionDays: policy.auditLogRetentionDays,
        fileRetentionDays: policy.fileRetentionDays,
        inactiveUserRetentionDays: policy.inactiveUserRetentionDays,
        autoDeleteEnabled: policy.autoDeleteEnabled,
      },
    });

    // Schedule enforcement if auto-delete is enabled
    if (policy.autoDeleteEnabled) {
      await this.scheduleRetentionEnforcement(tenantId);
    }

    this.logger.log(`Updated data retention policy for tenant ${tenantId}`);
  }

  async getDataRetentionPolicy(tenantId: string): Promise<DataRetentionPolicy | null> {
    const policy = await this.prisma.dataRetentionPolicy.findUnique({
      where: { tenantId },
    });

    if (!policy) return null;

    return {
      tenantId: policy.tenantId,
      auditLogRetentionDays: policy.auditLogRetentionDays,
      fileRetentionDays: policy.fileRetentionDays,
      inactiveUserRetentionDays: policy.inactiveUserRetentionDays,
      autoDeleteEnabled: policy.autoDeleteEnabled,
      lastEnforcedAt: policy.lastEnforcedAt,
    };
  }

  async generateComplianceReport(
    tenantId: string,
    reportType: ComplianceReport['reportType'],
    startDate: Date,
    endDate: Date,
  ): Promise<ComplianceReport> {
    const metrics = await this.gatherComplianceMetrics(tenantId, startDate, endDate);
    const findings = await this.performComplianceAudit(tenantId, reportType, startDate, endDate);

    const report: ComplianceReport = {
      tenantId,
      reportType,
      generatedAt: new Date(),
      period: { startDate, endDate },
      metrics,
      findings,
    };

    // Store report for future reference
    await this.storeComplianceReport(report);

    this.logger.log(`Generated ${reportType} compliance report for tenant ${tenantId}`);

    return report;
  }

  async enforceDataRetention(tenantId: string): Promise<{
    auditLogsDeleted: number;
    filesDeleted: number;
    usersDeactivated: number;
  }> {
    const policy = await this.getDataRetentionPolicy(tenantId);
    if (!policy || !policy.autoDeleteEnabled) {
      return { auditLogsDeleted: 0, filesDeleted: 0, usersDeactivated: 0 };
    }

    const results = {
      auditLogsDeleted: 0,
      filesDeleted: 0,
      usersDeactivated: 0,
    };

    // Delete old audit logs
    if (policy.auditLogRetentionDays > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.auditLogRetentionDays);

      const deletedLogs = await this.prisma.auditLog.deleteMany({
        where: {
          tenantId,
          at: { lt: cutoffDate },
        },
      });
      results.auditLogsDeleted = deletedLogs.count;
    }

    // Delete old files
    if (policy.fileRetentionDays > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.fileRetentionDays);

      const oldFiles = await this.prisma.file.findMany({
        where: {
          tenantId,
          at: { lt: cutoffDate },
        },
      });

      for (const file of oldFiles) {
        try {
          // Delete from S3
          await this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: this.bucketName,
              Key: file.s3Key,
            }),
          );
        } catch (error) {
          this.logger.warn(`Failed to delete S3 object ${file.s3Key}: ${error.message}`);
        }
      }

      const deletedFiles = await this.prisma.file.deleteMany({
        where: {
          tenantId,
          at: { lt: cutoffDate },
        },
      });
      results.filesDeleted = deletedFiles.count;
    }

    // Deactivate inactive users
    if (policy.inactiveUserRetentionDays > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.inactiveUserRetentionDays);

      const deactivatedUsers = await this.prisma.user.updateMany({
        where: {
          tenantId,
          active: true,
          lastLogin: { lt: cutoffDate },
        },
        data: { active: false },
      });
      results.usersDeactivated = deactivatedUsers.count;
    }

    // Update last enforced timestamp
    await this.prisma.dataRetentionPolicy.update({
      where: { tenantId },
      data: { lastEnforcedAt: new Date() },
    });

    this.logger.log(`Enforced data retention for tenant ${tenantId}:`, results);

    return results;
  }

  private async performDataExport(
    tenantId: string,
    exportId: string,
    format: 'json' | 'csv',
  ): Promise<void> {
    try {
      // Gather all tenant data
      const [users, quotes, files, auditLogs, settings] = await Promise.all([
        this.prisma.user.findMany({ where: { tenantId } }),
        this.prisma.quote.findMany({ where: { tenantId }, include: { items: true } }),
        this.prisma.file.findMany({ where: { tenantId } }),
        this.prisma.auditLog.findMany({ where: { tenantId } }),
        this.prisma.tenantSettings.findUnique({ where: { tenantId } }),
      ]);

      const exportData = {
        metadata: {
          tenantId,
          exportId,
          generatedAt: new Date(),
          format,
        },
        users: users.map((u) => ({
          ...u,
          password: '[REDACTED]', // Never export passwords
        })),
        quotes,
        files: files.map((f) => ({
          ...f,
          url: '[REDACTED]', // Don't export direct URLs
        })),
        auditLogs,
        settings,
      };

      let fileContent: Buffer;
      let contentType: string;
      let fileExtension: string;

      if (format === 'json') {
        fileContent = Buffer.from(JSON.stringify(exportData, null, 2));
        contentType = 'application/json';
        fileExtension = '.json';
      } else {
        // CSV format - create multiple CSV files in a ZIP
        fileContent = await this.createCSVExport(exportData);
        contentType = 'application/zip';
        fileExtension = '.zip';
      }

      // Upload to S3
      const key = `compliance-exports/${tenantId}/${exportId}${fileExtension}`;
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: fileContent,
          ContentType: contentType,
          Metadata: {
            tenantId,
            exportId,
            exportType: 'compliance-data-export',
          },
        }),
      );

      // TODO: Send email notification to tenant admins
      // await this.sendExportCompleteNotification(tenantId, exportId, key);

      this.logger.log(`Completed data export ${exportId} for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(
        `Failed to complete data export ${exportId} for tenant ${tenantId}: ${error.message}`,
      );
      // TODO: Send error notification
    }
  }

  private async createCSVExport(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      // Create CSV for each data type
      const csvConfigs = [
        { name: 'users.csv', data: data.users },
        { name: 'quotes.csv', data: data.quotes },
        { name: 'files.csv', data: data.files },
        { name: 'audit_logs.csv', data: data.auditLogs },
      ];

      for (const config of csvConfigs) {
        if (config.data.length > 0) {
          const csv = this.convertToCSV(config.data);
          archive.append(csv, { name: config.name });
        }
      }

      archive.finalize();
    });
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value).replace(/"/g, '""'); // Escape quotes
      }),
    );

    const csvContent = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  private async gatherComplianceMetrics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ComplianceReport['metrics']> {
    const [totalUsers, activeUsers, dataProcessingEvents, accessRequests, dataExports] =
      await Promise.all([
        this.prisma.user.count({ where: { tenantId } }),
        this.prisma.user.count({
          where: {
            tenantId,
            lastLogin: { gte: startDate, lte: endDate },
          },
        }),
        this.prisma.auditLog.count({
          where: {
            tenantId,
            action: { in: ['create', 'update', 'delete'] },
            at: { gte: startDate, lte: endDate },
          },
        }),
        this.prisma.auditLog.count({
          where: {
            tenantId,
            action: { contains: 'access' },
            at: { gte: startDate, lte: endDate },
          },
        }),
        this.prisma.auditLog.count({
          where: {
            tenantId,
            action: 'data_export',
            at: { gte: startDate, lte: endDate },
          },
        }),
      ]);

    return {
      totalUsers,
      activeUsers,
      dataProcessingEvents,
      securityIncidents: 0, // Would integrate with security monitoring
      accessRequests,
      dataExports,
    };
  }

  private async performComplianceAudit(
    tenantId: string,
    reportType: ComplianceReport['reportType'],
    startDate: Date,
    endDate: Date,
  ): Promise<ComplianceReport['findings']> {
    const findings: ComplianceReport['findings'] = [];

    // Check data retention policy compliance
    const policy = await this.getDataRetentionPolicy(tenantId);
    if (!policy) {
      findings.push({
        severity: 'medium',
        category: 'Data Retention',
        description: 'No data retention policy configured',
        remediation: 'Configure appropriate data retention policies for compliance',
      });
    }

    // Check for users without recent login (potential inactive accounts)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days

    const inactiveUsers = await this.prisma.user.count({
      where: {
        tenantId,
        active: true,
        lastLogin: { lt: cutoffDate },
      },
    });

    if (inactiveUsers > 0) {
      findings.push({
        severity: 'low',
        category: 'Access Management',
        description: `${inactiveUsers} active users have not logged in for 90+ days`,
        remediation: 'Review and deactivate unused accounts',
      });
    }

    // Check for excessive admin privileges
    const adminUsers = await this.prisma.user.count({
      where: {
        tenantId,
        role: 'admin',
        active: true,
      },
    });

    const totalUsers = await this.prisma.user.count({
      where: { tenantId, active: true },
    });

    if (totalUsers > 0 && adminUsers / totalUsers > 0.2) {
      findings.push({
        severity: 'medium',
        category: 'Privilege Management',
        description: `${Math.round((adminUsers / totalUsers) * 100)}% of users have admin privileges`,
        remediation: 'Review admin access and apply principle of least privilege',
      });
    }

    return findings;
  }

  private async storeComplianceReport(report: ComplianceReport): Promise<void> {
    const key = `compliance-reports/${report.tenantId}/${report.reportType}-${report.generatedAt.toISOString()}.json`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: JSON.stringify(report, null, 2),
        ContentType: 'application/json',
        Metadata: {
          tenantId: report.tenantId,
          reportType: report.reportType,
          generatedAt: report.generatedAt.toISOString(),
        },
      }),
    );
  }

  private async scheduleRetentionEnforcement(tenantId: string): Promise<void> {
    // In a real implementation, this would schedule a job with a task queue
    // For now, we'll log that it should be scheduled
    this.logger.log(`Should schedule data retention enforcement job for tenant ${tenantId}`);
  }
}
