import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
import { createWinstonLogger } from './winston.config';
import { TenantContextService } from '../../modules/tenant/tenant-context.service';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(
    private readonly tenantContext: TenantContextService,
  ) {
    this.logger = createWinstonLogger();
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    const meta = this.getMetadata(optionalParams);
    this.logger.info(message, meta);
  }

  error(message: any, trace?: string, context?: string) {
    const meta = this.getMetadata([trace, context]);
    this.logger.error(message, { ...meta, trace });
  }

  warn(message: any, ...optionalParams: any[]) {
    const meta = this.getMetadata(optionalParams);
    this.logger.warn(message, meta);
  }

  debug(message: any, ...optionalParams: any[]) {
    const meta = this.getMetadata(optionalParams);
    this.logger.debug(message, meta);
  }

  verbose(message: any, ...optionalParams: any[]) {
    const meta = this.getMetadata(optionalParams);
    this.logger.verbose(message, meta);
  }

  /**
   * Custom method for HTTP logging
   */
  http(message: string, meta?: any) {
    const context = this.tenantContext.getContext();
    this.logger.http(message, {
      ...meta,
      context: this.context,
      tenantId: context?.tenantId,
      userId: context?.userId,
      requestId: context?.requestId,
    });
  }

  /**
   * Custom method for audit logging
   */
  audit(action: string, entity: string, entityId: string, meta?: any) {
    const context = this.tenantContext.getContext();
    this.logger.info('Audit log', {
      audit: true,
      action,
      entity,
      entityId,
      ...meta,
      context: this.context,
      tenantId: context?.tenantId,
      userId: context?.userId,
      requestId: context?.requestId,
    });
  }

  /**
   * Custom method for security logging
   */
  security(event: string, meta?: any) {
    const context = this.tenantContext.getContext();
    this.logger.warn('Security event', {
      security: true,
      event,
      ...meta,
      context: this.context,
      tenantId: context?.tenantId,
      userId: context?.userId,
      requestId: context?.requestId,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
    });
  }

  /**
   * Custom method for performance logging
   */
  performance(operation: string, duration: number, meta?: any) {
    const context = this.tenantContext.getContext();
    this.logger.info('Performance metric', {
      performance: true,
      operation,
      duration,
      ...meta,
      context: this.context,
      tenantId: context?.tenantId,
      userId: context?.userId,
      requestId: context?.requestId,
    });
  }

  private getMetadata(optionalParams: any[]): any {
    const context = this.tenantContext.getContext();
    const meta: any = {
      context: this.context,
      tenantId: context?.tenantId,
      userId: context?.userId,
      requestId: context?.requestId,
      timestamp: new Date().toISOString(),
    };

    // Extract metadata from optional parameters
    if (optionalParams.length > 0) {
      const lastParam = optionalParams[optionalParams.length - 1];
      if (typeof lastParam === 'object' && !Array.isArray(lastParam)) {
        Object.assign(meta, lastParam);
      }
    }

    return meta;
  }
}