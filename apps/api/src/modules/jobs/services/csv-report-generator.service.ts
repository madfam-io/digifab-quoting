import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ReportGenerationJobData } from '../interfaces/job.interface';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class CsvReportGeneratorService {
  constructor(private readonly logger: LoggerService) {}

  async generateReport(
    reportType: ReportGenerationJobData['reportType'],
    data: any,
    options: ReportGenerationJobData['options'],
  ): Promise<{ filePath: string; fileName: string }> {
    const fileName = `${reportType}-${data.id || 'report'}-${Date.now()}.csv`;
    const filePath = join(tmpdir(), fileName);

    this.logger.log(`Generating CSV report: ${fileName}`);

    let csvContent = '';

    switch (reportType) {
      case 'quote':
      case 'order':
        csvContent = this.generateQuoteOrderCsv(data, reportType);
        break;
      case 'analytics':
        csvContent = this.generateAnalyticsCsv(data);
        break;
      case 'invoice':
        csvContent = this.generateInvoiceCsv(data);
        break;
      default:
        throw new Error(`CSV generation not supported for report type: ${reportType}`);
    }

    await this.writeFile(filePath, csvContent);
    this.logger.log(`CSV report generated successfully: ${fileName}`);

    return { filePath, fileName };
  }

  private generateQuoteOrderCsv(data: any, reportType: 'quote' | 'order'): string {
    const lines: string[] = [];

    // Header
    lines.push(`${reportType.toUpperCase()} REPORT`);
    lines.push('');

    // Basic information
    lines.push(`${reportType} Number,${data.number}`);
    lines.push(`Date,${new Date(data.createdAt).toLocaleDateString()}`);
    lines.push(`Status,${data.status}`);

    if (reportType === 'quote') {
      lines.push(`Valid Until,${new Date(data.validUntil).toLocaleDateString()}`);
      lines.push(`Currency,${data.currency}`);
    }

    // Customer information
    const customer = data.customer;
    if (customer) {
      lines.push('');
      lines.push('CUSTOMER INFORMATION');
      lines.push(`Name,${this.escapeCsvValue(customer.name || 'N/A')}`);
      lines.push(`Email,${customer.email || 'N/A'}`);
      lines.push(`Phone,${customer.phone || 'N/A'}`);
      lines.push(`Company,${this.escapeCsvValue(customer.company || 'N/A')}`);
    }

    // Items
    const items = reportType === 'order' ? data.quote?.items : data.items;
    if (items && items.length > 0) {
      lines.push('');
      lines.push('ITEMS');
      lines.push('Item #,File Name,Material,Process,Quantity,Unit Price,Total');

      items.forEach((item: any, index: number) => {
        const fileName = this.escapeCsvValue(
          item.files?.[0]?.originalName || item.name || 'Unknown',
        );
        const material = this.escapeCsvValue(item.material?.name || 'N/A');
        const process = this.escapeCsvValue(
          item.manufacturingProcess?.name || item.processCode || 'N/A',
        );
        const total = item.unitPrice * item.quantity;

        lines.push(
          `${index + 1},${fileName},${material},${process},${item.quantity},${item.unitPrice},${total}`,
        );
      });
    }

    // Totals
    lines.push('');
    lines.push('TOTALS');
    lines.push(`Subtotal,${data.subtotal || 0}`);
    lines.push(`Tax,${data.tax || 0}`);
    lines.push(`Shipping,${data.shipping || 0}`);
    lines.push(`Total,${data.total || 0}`);

    return lines.join('\n');
  }

  private generateInvoiceCsv(invoice: any): string {
    const lines: string[] = [];

    // Header
    lines.push('INVOICE');
    lines.push(`Invoice Number,${invoice.number}`);
    lines.push(`Issue Date,${new Date(invoice.issuedAt).toLocaleDateString()}`);
    lines.push(`Due Date,${new Date(invoice.dueAt).toLocaleDateString()}`);
    lines.push(`Status,${invoice.status}`);
    lines.push(`Currency,${invoice.currency}`);

    // Company information
    if (invoice.tenant) {
      lines.push('');
      lines.push('FROM');
      lines.push(`Company,${this.escapeCsvValue(invoice.tenant.name)}`);
      if (invoice.tenant.taxId) {
        lines.push(`Tax ID,${invoice.tenant.taxId}`);
      }
    }

    // Customer information
    if (invoice.customer) {
      lines.push('');
      lines.push('BILL TO');
      lines.push(`Customer,${this.escapeCsvValue(invoice.customer.name)}`);
      lines.push(`Company,${this.escapeCsvValue(invoice.customer.company || 'N/A')}`);
      lines.push(`Email,${invoice.customer.email}`);

      if (invoice.customer.billingAddress) {
        const addr = invoice.customer.billingAddress;
        lines.push(
          `Address,"${this.escapeCsvValue(
            [addr.street, addr.city, addr.state, addr.postalCode, addr.country]
              .filter(Boolean)
              .join(', '),
          )}"`,
        );
      }
    }

    // Line items
    if (invoice.order?.quote?.items) {
      lines.push('');
      lines.push('LINE ITEMS');
      lines.push('Item #,Description,Quantity,Unit Price,Total');

      invoice.order.quote.items.forEach((item: any, index: number) => {
        const description = this.escapeCsvValue(item.name || 'Item');
        const total = item.unitPrice * item.quantity;
        lines.push(`${index + 1},${description},${item.quantity},${item.unitPrice},${total}`);
      });
    }

    // Totals
    lines.push('');
    lines.push('INVOICE TOTALS');
    lines.push(`Subtotal,${invoice.subtotal || 0}`);
    lines.push(`Tax,${invoice.tax || 0}`);
    lines.push(`Total,${invoice.total || 0}`);
    lines.push(`Amount Paid,${invoice.totalPaid || 0}`);
    lines.push(`Balance Due,${(invoice.total || 0) - (invoice.totalPaid || 0)}`);

    return lines.join('\n');
  }

  private generateAnalyticsCsv(data: any): string {
    const lines: string[] = [];

    // Header
    lines.push('ANALYTICS REPORT');
    lines.push(
      `Period,${new Date(data.criteria.startDate).toLocaleDateString()} - ${new Date(data.criteria.endDate).toLocaleDateString()}`,
    );
    lines.push('');

    // Quote statistics
    if (data.quotes && data.quotes.length > 0) {
      lines.push('QUOTE STATISTICS');
      lines.push('Status,Count,Total Value');
      data.quotes.forEach((stat: any) => {
        lines.push(`${stat.status},${stat._count},${stat._sum.total || 0}`);
      });
      lines.push('');
    }

    // Order statistics
    if (data.orders && data.orders.length > 0) {
      lines.push('ORDER STATISTICS');
      lines.push('Status,Count,Total Paid');
      data.orders.forEach((stat: any) => {
        lines.push(`${stat.status},${stat._count},${stat._sum.totalPaid || 0}`);
      });
      lines.push('');
    }

    // Revenue by period
    if (data.revenue && data.revenue.length > 0) {
      lines.push('REVENUE BY PERIOD');
      lines.push('Date,Order Count,Revenue');
      data.revenue.forEach((period: any) => {
        lines.push(
          `${new Date(period.period).toLocaleDateString()},${period.order_count},${period.revenue}`,
        );
      });
    }

    // Summary
    lines.push('');
    lines.push('SUMMARY');
    const totalQuotes = data.quotes?.reduce((sum: number, q: any) => sum + q._count, 0) || 0;
    const totalOrders = data.orders?.reduce((sum: number, o: any) => sum + o._count, 0) || 0;
    const totalRevenue =
      data.revenue?.reduce((sum: number, r: any) => sum + (r.revenue || 0), 0) || 0;

    lines.push(`Total Quotes,${totalQuotes}`);
    lines.push(`Total Orders,${totalOrders}`);
    lines.push(`Total Revenue,${totalRevenue}`);

    if (totalQuotes > 0) {
      const conversionRate = ((totalOrders / totalQuotes) * 100).toFixed(2);
      lines.push(`Conversion Rate,${conversionRate}%`);
    }

    return lines.join('\n');
  }

  private escapeCsvValue(value: string): string {
    if (!value) return '';

    // If value contains comma, newline, or double quote, wrap in quotes
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
      // Escape double quotes by doubling them
      value = value.replace(/"/g, '""');
      return `"${value}"`;
    }

    return value;
  }

  private async writeFile(filePath: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = createWriteStream(filePath);
      stream.write(content);
      stream.end();

      stream.on('finish', () => resolve());
      stream.on('error', (error) => reject(error));
    });
  }
}
