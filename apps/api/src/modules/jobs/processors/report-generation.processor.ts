import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { 
  JobType, 
  ReportGenerationJobData, 
  JobResult,
  JobProgress,
} from '../interfaces/job.interface';
import { LoggerService } from '@/common/logger/logger.service';
import { PrismaService } from '@/prisma/prisma.service';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { unlink } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

interface ReportResult {
  reportId: string;
  reportType: ReportGenerationJobData['reportType'];
  format: ReportGenerationJobData['format'];
  fileUrl: string;
  fileName: string;
  fileSize: number;
  generatedAt: Date;
}

@Processor(JobType.REPORT_GENERATION)
@Injectable()
export class ReportGenerationProcessor {
  private s3: S3;

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.s3 = new S3({
      region: this.configService.get('aws.region'),
      accessKeyId: this.configService.get('aws.accessKeyId'),
      secretAccessKey: this.configService.get('aws.secretAccessKey'),
    });
  }

  @Process()
  async handleReportGeneration(job: Job<ReportGenerationJobData>): Promise<JobResult<ReportResult>> {
    const startTime = Date.now();
    const { reportType, entityId, format, options, tenantId } = job.data;

    try {
      this.logger.log(`Starting ${reportType} report generation`, {
        jobId: job.id,
        tenantId,
        entityId,
        format,
      });

      await this.updateProgress(job, 10, 'Loading data');

      // Load report data based on type
      const reportData = await this.loadReportData(reportType, entityId, tenantId);
      if (!reportData) {
        throw new Error(`Entity ${entityId} not found for report type ${reportType}`);
      }

      await this.updateProgress(job, 30, 'Generating report');

      // Generate report based on format
      let filePath: string;
      let fileName: string;

      switch (format) {
        case 'pdf':
          ({ filePath, fileName } = await this.generatePdfReport(
            reportType,
            reportData,
            options,
            job,
          ));
          break;
        case 'excel':
          ({ filePath, fileName } = await this.generateExcelReport(
            reportType,
            reportData,
            options,
            job,
          ));
          break;
        case 'csv':
          ({ filePath, fileName } = await this.generateCsvReport(
            reportType,
            reportData,
            options,
            job,
          ));
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      await this.updateProgress(job, 80, 'Uploading report');

      // Upload to S3
      const fileUrl = await this.uploadToS3(filePath, fileName, tenantId);
      
      // Get file size
      const stats = await require('fs/promises').stat(filePath);
      const fileSize = stats.size;

      // Clean up temp file
      await unlink(filePath);

      await this.updateProgress(job, 90, 'Saving report metadata');

      // Save report metadata
      const reportId = await this.saveReportMetadata(
        reportType,
        entityId,
        fileName,
        fileUrl,
        fileSize,
        tenantId,
      );

      await this.updateProgress(job, 100, 'Report generation completed');

      return {
        success: true,
        data: {
          reportId,
          reportType,
          format,
          fileUrl,
          fileName,
          fileSize,
          generatedAt: new Date(),
        },
        duration: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`Report generation failed`, error, {
        jobId: job.id,
        reportType,
        entityId,
      });

      return {
        success: false,
        error: {
          code: 'REPORT_GENERATION_FAILED',
          message: error.message || 'Report generation failed',
          details: error,
        },
        duration: Date.now() - startTime,
      };
    }
  }

  @OnQueueActive()
  onActive(job: Job<ReportGenerationJobData>) {
    this.logger.log(`Report generation job ${job.id} started`, {
      reportType: job.data.reportType,
      entityId: job.data.entityId,
    });
  }

  @OnQueueCompleted()
  onComplete(job: Job<ReportGenerationJobData>, result: JobResult<ReportResult>) {
    this.logger.log(`Report generation job ${job.id} completed`, {
      reportType: job.data.reportType,
      entityId: job.data.entityId,
      success: result.success,
    });
  }

  @OnQueueFailed()
  onFailed(job: Job<ReportGenerationJobData>, err: Error) {
    this.logger.error(`Report generation job ${job.id} failed`, err, {
      reportType: job.data.reportType,
      entityId: job.data.entityId,
      attempts: job.attemptsMade,
    });
  }

  private async updateProgress(
    job: Job<ReportGenerationJobData>,
    percentage: number,
    message: string,
  ): Promise<void> {
    const progress: JobProgress = {
      percentage,
      message,
      step: this.getStepFromPercentage(percentage),
    };

    await job.progress(progress);
    await job.log(`${message} (${percentage}%)`);
  }

  private getStepFromPercentage(percentage: number): string {
    if (percentage <= 20) return 'loading-data';
    if (percentage <= 70) return 'generating-report';
    if (percentage <= 85) return 'uploading';
    return 'finalizing';
  }

  private async loadReportData(
    reportType: ReportGenerationJobData['reportType'],
    entityId: string,
    tenantId: string,
  ): Promise<any> {
    switch (reportType) {
      case 'quote':
        return this.prisma.quote.findUnique({
          where: { id: entityId, tenantId },
          include: {
            items: {
              include: {
                file: true,
                material: true,
                process: true,
              },
            },
            customer: true,
            tenant: true,
          },
        });

      case 'order':
        return this.prisma.order.findUnique({
          where: { id: entityId, tenantId },
          include: {
            quote: {
              include: {
                items: {
                  include: {
                    file: true,
                    material: true,
                    process: true,
                  },
                },
              },
            },
            customer: true,
            tenant: true,
          },
        });

      case 'invoice':
        return this.prisma.invoice.findUnique({
          where: { id: entityId, tenantId },
          include: {
            order: {
              include: {
                quote: {
                  include: {
                    items: true,
                  },
                },
              },
            },
            customer: true,
            tenant: true,
          },
        });

      case 'analytics':
        // For analytics, entityId might be a date range or filter criteria
        const criteria = JSON.parse(entityId);
        return this.loadAnalyticsData(criteria, tenantId);

      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  private async loadAnalyticsData(criteria: any, tenantId: string): Promise<any> {
    const { startDate, endDate, groupBy = 'day' } = criteria;

    const [quotes, orders, revenue] = await Promise.all([
      // Quote statistics
      this.prisma.quote.groupBy({
        by: ['status'],
        where: {
          tenantId,
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        _count: true,
        _sum: {
          total: true,
        },
      }),

      // Order statistics  
      this.prisma.order.groupBy({
        by: ['status'],
        where: {
          tenantId,
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        _count: true,
        _sum: {
          totalPaid: true,
        },
      }),

      // Revenue by day/week/month
      this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC(${groupBy}, created_at) as period,
          COUNT(*) as order_count,
          SUM(total_paid) as revenue
        FROM orders
        WHERE tenant_id = ${tenantId}
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
          AND status = 'COMPLETED'
        GROUP BY period
        ORDER BY period
      `,
    ]);

    return {
      criteria,
      quotes,
      orders,
      revenue,
      generatedAt: new Date(),
    };
  }

  private async generatePdfReport(
    reportType: ReportGenerationJobData['reportType'],
    data: any,
    options: ReportGenerationJobData['options'],
    job: Job<ReportGenerationJobData>,
  ): Promise<{ filePath: string; fileName: string }> {
    const fileName = `${reportType}-${data.id || 'report'}-${Date.now()}.pdf`;
    const filePath = join(tmpdir(), fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = createWriteStream(filePath);
      doc.pipe(stream);

      // Add report header
      doc.fontSize(20).text(this.getReportTitle(reportType, options?.language), {
        align: 'center',
      });
      doc.moveDown();

      // Add report content based on type
      switch (reportType) {
        case 'quote':
          this.addQuoteContent(doc, data, options);
          break;
        case 'order':
          this.addOrderContent(doc, data, options);
          break;
        case 'invoice':
          this.addInvoiceContent(doc, data, options);
          break;
        case 'analytics':
          this.addAnalyticsContent(doc, data, options);
          break;
      }

      // Add footer
      doc.fontSize(10)
        .text(`Generated on ${new Date().toLocaleString()}`, 50, doc.page.height - 50, {
          align: 'center',
        });

      doc.end();

      stream.on('finish', () => {
        resolve({ filePath, fileName });
      });

      stream.on('error', reject);
    });
  }

  private async generateExcelReport(
    reportType: ReportGenerationJobData['reportType'],
    data: any,
    options: ReportGenerationJobData['options'],
    job: Job<ReportGenerationJobData>,
  ): Promise<{ filePath: string; fileName: string }> {
    const fileName = `${reportType}-${data.id || 'report'}-${Date.now()}.xlsx`;
    const filePath = join(tmpdir(), fileName);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MADFAM Quoting System';
    workbook.created = new Date();

    switch (reportType) {
      case 'quote':
      case 'order':
        this.addQuoteOrderSheet(workbook, data, reportType, options);
        break;
      case 'invoice':
        this.addInvoiceSheet(workbook, data, options);
        break;
      case 'analytics':
        this.addAnalyticsSheets(workbook, data, options);
        break;
    }

    await workbook.xlsx.writeFile(filePath);

    return { filePath, fileName };
  }

  private async generateCsvReport(
    reportType: ReportGenerationJobData['reportType'],
    data: any,
    options: ReportGenerationJobData['options'],
    job: Job<ReportGenerationJobData>,
  ): Promise<{ filePath: string; fileName: string }> {
    const fileName = `${reportType}-${data.id || 'report'}-${Date.now()}.csv`;
    const filePath = join(tmpdir(), fileName);

    // Simple CSV generation - in production, use a proper CSV library
    let csvContent = '';

    switch (reportType) {
      case 'quote':
      case 'order':
        csvContent = this.generateQuoteOrderCsv(data, reportType);
        break;
      case 'analytics':
        csvContent = this.generateAnalyticsCsv(data);
        break;
      default:
        throw new Error(`CSV not supported for ${reportType}`);
    }

    await require('fs/promises').writeFile(filePath, csvContent);

    return { filePath, fileName };
  }

  private getReportTitle(
    reportType: ReportGenerationJobData['reportType'],
    language?: 'en' | 'es',
  ): string {
    const titles = {
      en: {
        quote: 'Quote Report',
        order: 'Order Report',
        invoice: 'Invoice',
        analytics: 'Analytics Report',
      },
      es: {
        quote: 'Reporte de Cotización',
        order: 'Reporte de Pedido',
        invoice: 'Factura',
        analytics: 'Reporte de Análisis',
      },
    };

    return titles[language || 'en'][reportType];
  }

  private addQuoteContent(doc: PDFDocument, quote: any, options: any): void {
    // Customer information
    doc.fontSize(14).text('Customer Information', { underline: true });
    doc.fontSize(12)
      .text(`Name: ${quote.customer.name}`)
      .text(`Email: ${quote.customer.email}`)
      .text(`Phone: ${quote.customer.phone || 'N/A'}`)
      .moveDown();

    // Quote details
    doc.fontSize(14).text('Quote Details', { underline: true });
    doc.fontSize(12)
      .text(`Quote Number: ${quote.number}`)
      .text(`Date: ${quote.createdAt.toLocaleDateString()}`)
      .text(`Valid Until: ${quote.validUntil.toLocaleDateString()}`)
      .text(`Status: ${quote.status}`)
      .moveDown();

    // Items
    if (options?.includeItemDetails) {
      doc.fontSize(14).text('Items', { underline: true });
      quote.items.forEach((item: any, index: number) => {
        doc.fontSize(12)
          .text(`${index + 1}. ${item.file.fileName}`)
          .text(`   Material: ${item.material.name}`)
          .text(`   Process: ${item.process.name}`)
          .text(`   Quantity: ${item.quantity}`)
          .text(`   Unit Price: ${quote.currency} ${item.unitPrice}`)
          .text(`   Total: ${quote.currency} ${item.totalPrice}`)
          .moveDown(0.5);
      });
    }

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(12)
      .text(`Subtotal: ${quote.currency} ${quote.subtotal}`)
      .text(`Tax: ${quote.currency} ${quote.tax}`)
      .text(`Total: ${quote.currency} ${quote.total}`, { 
        font: 'Helvetica-Bold' 
      });
  }

  private addOrderContent(doc: PDFDocument, order: any, options: any): void {
    // Similar to quote but with order-specific fields
    this.addQuoteContent(doc, order.quote, options);
    
    doc.moveDown()
      .fontSize(14).text('Order Information', { underline: true })
      .fontSize(12)
      .text(`Order Number: ${order.number}`)
      .text(`Order Date: ${order.createdAt.toLocaleDateString()}`)
      .text(`Payment Status: ${order.paymentStatus}`)
      .text(`Delivery Status: ${order.status}`);
  }

  private addInvoiceContent(doc: PDFDocument, invoice: any, options: any): void {
    // Invoice header
    doc.fontSize(16).text(`INVOICE #${invoice.number}`, { align: 'right' });
    doc.moveDown();

    // Billing information
    doc.fontSize(12)
      .text('Bill To:', { font: 'Helvetica-Bold' })
      .text(invoice.customer.name)
      .text(invoice.customer.email)
      .text(invoice.customer.address || '')
      .moveDown();

    // Invoice details
    doc.text(`Invoice Date: ${invoice.createdAt.toLocaleDateString()}`)
      .text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`)
      .moveDown();

    // Line items table would go here
    // ... implementation details ...

    // Total
    doc.fontSize(14)
      .text(`Total Due: ${invoice.currency} ${invoice.total}`, {
        align: 'right',
        font: 'Helvetica-Bold',
      });
  }

  private addAnalyticsContent(doc: PDFDocument, data: any, options: any): void {
    doc.fontSize(14).text('Report Period', { underline: true })
      .fontSize(12)
      .text(`From: ${new Date(data.criteria.startDate).toLocaleDateString()}`)
      .text(`To: ${new Date(data.criteria.endDate).toLocaleDateString()}`)
      .moveDown();

    // Summary statistics
    doc.fontSize(14).text('Summary', { underline: true });
    
    const totalQuotes = data.quotes.reduce((sum: number, q: any) => sum + q._count, 0);
    const totalOrders = data.orders.reduce((sum: number, o: any) => sum + o._count, 0);
    const totalRevenue = data.orders
      .filter((o: any) => o.status === 'COMPLETED')
      .reduce((sum: number, o: any) => sum + (o._sum.totalPaid || 0), 0);

    doc.fontSize(12)
      .text(`Total Quotes: ${totalQuotes}`)
      .text(`Total Orders: ${totalOrders}`)
      .text(`Total Revenue: ${data.criteria.currency || 'MXN'} ${totalRevenue.toFixed(2)}`)
      .text(`Conversion Rate: ${((totalOrders / totalQuotes) * 100).toFixed(1)}%`)
      .moveDown();

    // Charts would be added here in a real implementation
  }

  private addQuoteOrderSheet(
    workbook: ExcelJS.Workbook,
    data: any,
    type: string,
    options: any,
  ): void {
    const sheet = workbook.addWorksheet(type === 'quote' ? 'Quote' : 'Order');

    // Headers
    sheet.columns = [
      { header: 'Item', key: 'item', width: 30 },
      { header: 'Material', key: 'material', width: 20 },
      { header: 'Process', key: 'process', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Unit Price', key: 'unitPrice', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
    ];

    // Data
    const items = type === 'quote' ? data.items : data.quote.items;
    items.forEach((item: any) => {
      sheet.addRow({
        item: item.file.fileName,
        material: item.material.name,
        process: item.process.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.totalPrice,
      });
    });

    // Summary
    sheet.addRow({});
    sheet.addRow({ item: 'Subtotal', total: data.subtotal || data.quote.subtotal });
    sheet.addRow({ item: 'Tax', total: data.tax || data.quote.tax });
    sheet.addRow({ item: 'Total', total: data.total || data.quote.total });

    // Formatting
    sheet.getRow(1).font = { bold: true };
    sheet.getColumn('unitPrice').numFmt = '"$"#,##0.00';
    sheet.getColumn('total').numFmt = '"$"#,##0.00';
  }

  private addInvoiceSheet(workbook: ExcelJS.Workbook, invoice: any, options: any): void {
    const sheet = workbook.addWorksheet('Invoice');

    // Add invoice data similar to quote/order
    // Implementation details...
  }

  private addAnalyticsSheets(workbook: ExcelJS.Workbook, data: any, options: any): void {
    // Revenue sheet
    const revenueSheet = workbook.addWorksheet('Revenue');
    revenueSheet.columns = [
      { header: 'Period', key: 'period', width: 20 },
      { header: 'Orders', key: 'orders', width: 10 },
      { header: 'Revenue', key: 'revenue', width: 15 },
    ];

    data.revenue.forEach((row: any) => {
      revenueSheet.addRow({
        period: row.period,
        orders: row.order_count,
        revenue: row.revenue,
      });
    });

    // Quote status sheet
    const quoteSheet = workbook.addWorksheet('Quotes');
    quoteSheet.columns = [
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Count', key: 'count', width: 10 },
      { header: 'Value', key: 'value', width: 15 },
    ];

    data.quotes.forEach((row: any) => {
      quoteSheet.addRow({
        status: row.status,
        count: row._count,
        value: row._sum.total || 0,
      });
    });
  }

  private generateQuoteOrderCsv(data: any, type: string): string {
    const items = type === 'quote' ? data.items : data.quote.items;
    
    let csv = 'Item,Material,Process,Quantity,Unit Price,Total\n';
    
    items.forEach((item: any) => {
      csv += `"${item.file.fileName}","${item.material.name}","${item.process.name}",${item.quantity},${item.unitPrice},${item.totalPrice}\n`;
    });

    csv += `\n,,,,Subtotal,${data.subtotal || data.quote.subtotal}\n`;
    csv += `,,,,Tax,${data.tax || data.quote.tax}\n`;
    csv += `,,,,Total,${data.total || data.quote.total}\n`;

    return csv;
  }

  private generateAnalyticsCsv(data: any): string {
    let csv = 'Period,Orders,Revenue\n';
    
    data.revenue.forEach((row: any) => {
      csv += `${row.period},${row.order_count},${row.revenue}\n`;
    });

    return csv;
  }

  private async uploadToS3(
    filePath: string,
    fileName: string,
    tenantId: string,
  ): Promise<string> {
    const fileContent = await require('fs/promises').readFile(filePath);
    const key = `${tenantId}/reports/${Date.now()}-${fileName}`;

    const params = {
      Bucket: this.configService.get('aws.s3.bucket'),
      Key: key,
      Body: fileContent,
      ContentType: this.getContentType(fileName),
      ServerSideEncryption: 'AES256',
      Metadata: {
        tenantId,
        generatedAt: new Date().toISOString(),
      },
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }

  private getContentType(fileName: string): string {
    if (fileName.endsWith('.pdf')) return 'application/pdf';
    if (fileName.endsWith('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (fileName.endsWith('.csv')) return 'text/csv';
    return 'application/octet-stream';
  }

  private async saveReportMetadata(
    reportType: string,
    entityId: string,
    fileName: string,
    fileUrl: string,
    fileSize: number,
    tenantId: string,
  ): Promise<string> {
    const report = await this.prisma.report.create({
      data: {
        id: uuidv4(),
        tenantId,
        type: reportType,
        entityId,
        fileName,
        fileUrl,
        fileSize,
        status: 'COMPLETED',
        generatedAt: new Date(),
        metadata: {
          format: fileName.split('.').pop(),
        },
      },
    });

    return report.id;
  }
}