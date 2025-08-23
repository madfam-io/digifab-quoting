import { Injectable, Logger } from '@nestjs/common';
import { CloudWatch, MetricDatum } from '@aws-sdk/client-cloudwatch';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudWatchService {
  private readonly logger = new Logger(CloudWatchService.name);
  private cloudWatch: CloudWatch;
  private namespace: string;
  private environment: string;

  constructor(private configService: ConfigService) {
    this.cloudWatch = new CloudWatch({
      region: this.configService.get('AWS_REGION', 'us-east-1'),
    });
    this.namespace = 'MADFAM/Quoting';
    this.environment = this.configService.get('NODE_ENV', 'development');
  }

  async putMetric(
    metricName: string,
    value: number,
    unit: string = 'Count',
    dimensions?: Record<string, string>,
  ): Promise<void> {
    try {
      const metric: MetricDatum = {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date(),
        Dimensions: [
          { Name: 'Environment', Value: this.environment },
          ...Object.entries(dimensions || {}).map(([name, value]) => ({
            Name: name,
            Value: value,
          })),
        ],
      };

      await this.cloudWatch.putMetricData({
        Namespace: this.namespace,
        MetricData: [metric],
      });
    } catch (error) {
      this.logger.error(`Failed to put metric ${metricName}:`, error);
    }
  }

  async recordApiLatency(
    endpoint: string,
    latency: number,
    statusCode: number,
  ): Promise<void> {
    await this.putMetric('APILatency', latency, 'Milliseconds', {
      Endpoint: endpoint,
      StatusCode: statusCode.toString(),
    });
  }

  async recordQuoteProcessing(
    processType: string,
    duration: number,
    success: boolean,
  ): Promise<void> {
    await this.putMetric('QuoteProcessingTime', duration, 'Seconds', {
      ProcessType: processType,
      Status: success ? 'Success' : 'Failed',
    });

    await this.putMetric('QuoteProcessingCount', 1, 'Count', {
      ProcessType: processType,
      Status: success ? 'Success' : 'Failed',
    });
  }

  async recordFileUpload(
    fileType: string,
    fileSize: number,
    success: boolean,
  ): Promise<void> {
    await this.putMetric('FileUploadSize', fileSize, 'Bytes', {
      FileType: fileType,
      Status: success ? 'Success' : 'Failed',
    });

    await this.putMetric('FileUploadCount', 1, 'Count', {
      FileType: fileType,
      Status: success ? 'Success' : 'Failed',
    });
  }

  async recordPaymentEvent(
    eventType: string,
    amount: number,
    currency: string,
    success: boolean,
  ): Promise<void> {
    await this.putMetric('PaymentAmount', amount, 'None', {
      EventType: eventType,
      Currency: currency,
      Status: success ? 'Success' : 'Failed',
    });

    await this.putMetric('PaymentCount', 1, 'Count', {
      EventType: eventType,
      Status: success ? 'Success' : 'Failed',
    });
  }

  async recordCacheMetrics(
    operation: 'hit' | 'miss' | 'set' | 'delete',
    cacheType: string,
  ): Promise<void> {
    await this.putMetric('CacheOperation', 1, 'Count', {
      Operation: operation,
      CacheType: cacheType,
    });
  }

  async recordDatabaseQuery(
    model: string,
    operation: string,
    duration: number,
  ): Promise<void> {
    await this.putMetric('DatabaseQueryTime', duration, 'Milliseconds', {
      Model: model,
      Operation: operation,
    });
  }

  async recordError(
    errorType: string,
    errorCode: string,
    path?: string,
  ): Promise<void> {
    await this.putMetric('ApplicationError', 1, 'Count', {
      ErrorType: errorType,
      ErrorCode: errorCode,
      ...(path && { Path: path }),
    });
  }

  async recordCustomMetric(
    name: string,
    value: number,
    unit: string,
    dimensions?: Record<string, string>,
  ): Promise<void> {
    await this.putMetric(name, value, unit, dimensions);
  }

  // Create CloudWatch alarms programmatically
  async createAlarm(
    alarmName: string,
    metricName: string,
    threshold: number,
    comparisonOperator: string,
    evaluationPeriods: number = 2,
    period: number = 300,
  ): Promise<void> {
    try {
      await this.cloudWatch.putMetricAlarm({
        AlarmName: `${this.environment}-${alarmName}`,
        ComparisonOperator: comparisonOperator,
        EvaluationPeriods: evaluationPeriods,
        MetricName: metricName,
        Namespace: this.namespace,
        Period: period,
        Statistic: 'Average',
        Threshold: threshold,
        ActionsEnabled: true,
        AlarmDescription: `Alarm for ${metricName} in ${this.environment}`,
        Dimensions: [{ Name: 'Environment', Value: this.environment }],
      });
    } catch (error) {
      this.logger.error(`Failed to create alarm ${alarmName}:`, error);
    }
  }
}