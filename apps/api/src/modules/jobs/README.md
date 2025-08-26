# Job Queue System

This module provides async job processing capabilities using Bull (Redis-based queue) for the Cotiza Studio Quoting MVP.

## Features

- **Multiple Job Types**: File analysis, quote calculation, email notifications, report generation
- **Priority Queue**: Jobs can be prioritized for processing order
- **Retry Logic**: Automatic retry with exponential backoff
- **Job Scheduling**: Schedule jobs for future execution
- **Recurring Jobs**: Support for cron-based recurring jobs
- **Dead Letter Queue**: Failed jobs are moved to DLQ after max attempts
- **Progress Tracking**: Real-time job progress updates
- **Queue Metrics**: Monitor queue health and performance
- **Tenant Isolation**: All jobs are scoped to tenants

## Job Types

### 1. File Analysis (`file-analysis`)

Processes uploaded files asynchronously to extract geometry, perform DFM analysis, and calculate volumes.

### 2. Quote Calculation (`quote-calculation`)

Calculates complex quotes in the background, including pricing, lead times, and cost breakdowns.

### 3. Email Notification (`email-notification`)

Sends email notifications for various events (quote ready, accepted, expired, order shipped).

### 4. Report Generation (`report-generation`)

Generates PDF, Excel, or CSV reports for quotes, orders, invoices, and analytics.

## API Endpoints

### Create Job

```http
POST /api/v1/jobs
Authorization: Bearer <token>

{
  "type": "file-analysis",
  "data": {
    "fileId": "file-123",
    "fileUrl": "s3://bucket/file.stl",
    "fileName": "part.stl",
    "fileType": "stl"
  },
  "options": {
    "priority": 1,
    "attempts": 3
  }
}
```

### Schedule Job

```http
POST /api/v1/jobs/schedule
Authorization: Bearer <token>

{
  "type": "email-notification",
  "data": {
    "type": "quote-ready",
    "recipientEmail": "customer@example.com",
    "templateData": {...}
  },
  "delay": 300000 // 5 minutes
}
```

### Get Job Status

```http
GET /api/v1/jobs/{jobId}
Authorization: Bearer <token>
```

### Get Queue Metrics

```http
GET /api/v1/jobs/queues/metrics?type=file-analysis
Authorization: Bearer <token>
```

### Retry Failed Job

```http
POST /api/v1/jobs/{jobId}/retry
Authorization: Bearer <token>
```

### Cancel Job

```http
DELETE /api/v1/jobs/{jobId}
Authorization: Bearer <token>
```

## Usage Examples

### Basic Job Creation

```typescript
const job = await jobsService.addJob(JobType.FILE_ANALYSIS, {
  tenantId: 'tenant-123',
  fileId: 'file-456',
  fileUrl: 's3://bucket/file.stl',
  fileName: 'part.stl',
  fileType: 'stl',
  analysisOptions: {
    performDfm: true,
    extractGeometry: true,
  },
});
```

### Scheduled Job

```typescript
const job = await jobsService.scheduleJob(
  JobType.EMAIL_NOTIFICATION,
  {
    tenantId: 'tenant-123',
    type: 'quote-expired',
    recipientEmail: 'customer@example.com',
    templateData: { quoteNumber: 'Q-123' },
  },
  86400000, // 24 hours delay
);
```

### Recurring Job

```typescript
await jobsService.addRecurringJob(
  JobType.REPORT_GENERATION,
  {
    tenantId: 'tenant-123',
    reportType: 'analytics',
    format: 'pdf',
  },
  '0 2 * * *', // Daily at 2 AM
);
```

## Configuration

### Environment Variables

```env
# Redis configuration
REDIS_URL=redis://localhost:6379

# Worker service
WORKER_SERVICE_URL=http://localhost:8000

# Email configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=password

# AWS S3 configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET=madfam-files
```

### Queue Options

Each queue type has specific default options:

```typescript
// File Analysis Queue
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  timeout: 300000 // 5 minutes
}

// Quote Calculation Queue
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 3000 },
  timeout: 120000 // 2 minutes
}

// Email Notification Queue
{
  attempts: 5,
  backoff: { type: 'exponential', delay: 10000 },
  timeout: 30000 // 30 seconds
}

// Report Generation Queue
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  timeout: 180000 // 3 minutes
}
```

## Monitoring

### Queue Health Check

```http
GET /api/v1/jobs/health/check
```

Response:

```json
{
  "status": "healthy",
  "queues": 4,
  "totalJobs": 152,
  "metrics": [
    {
      "name": "file-analysis",
      "active": 2,
      "failed": 1,
      "failedRate": 2.5,
      "paused": false
    }
  ]
}
```

### Dead Letter Queue Processing

Failed jobs are automatically moved to the dead letter queue after maximum attempts. Monitor and process these manually:

```typescript
// In a scheduled task or admin panel
const deadLetterJobs = await deadLetterQueue.getJobs(['waiting']);
for (const job of deadLetterJobs) {
  // Analyze failure reason
  // Potentially fix data and retry
  // Or notify administrators
}
```

## Best Practices

1. **Use Appropriate Priority**: Higher priority (lower number) for customer-facing operations
2. **Set Reasonable Timeouts**: Avoid jobs running indefinitely
3. **Handle Progress Updates**: Update job progress for long-running operations
4. **Monitor Queue Metrics**: Set up alerts for high failure rates
5. **Clean Old Jobs**: Regularly clean completed/failed jobs to save memory
6. **Use Tenant Context**: Always include tenantId in job data
7. **Implement Idempotency**: Ensure job processors can be safely retried

## Error Handling

Jobs will automatically retry on failure according to their configuration. Common error scenarios:

- **Network Errors**: Automatically retried with exponential backoff
- **Invalid Data**: Job fails immediately, moved to DLQ
- **Timeout**: Job is marked as stalled and retried
- **Worker Crash**: Jobs are automatically recovered and retried

## Scaling

The job system is designed to scale horizontally:

1. **Add More Workers**: Run multiple instances of the API with job processors
2. **Redis Cluster**: Use Redis cluster for high availability
3. **Queue Sharding**: Create multiple queues for different priorities/tenants
4. **Rate Limiting**: Configure concurrency limits per queue

```typescript
// Configure concurrency in processor
@Processor('file-analysis', { concurrency: 5 })
export class FileAnalysisProcessor {
  // Process up to 5 jobs concurrently
}
```
