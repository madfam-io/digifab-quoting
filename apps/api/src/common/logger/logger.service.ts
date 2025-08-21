import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
import { createWinstonLogger } from './winston.config';
import { TenantContextService } from '../../modules/tenant/tenant-context.service';
import { 
  formatErrorForLogging 
} from '../utils/error-handling';
import {
  LogMetadata,
  HttpLogMetadata,
  AuditLogMetadata,
  SecurityLogMetadata,
  PerformanceLogMetadata,
  ErrorLogMetadata,
} from './logger.interface';

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

  log(message: string, context?: string | LogMetadata): void {
    const meta = this.buildMetadata(context);
    this.logger.info(message, meta);
  }

  error(message: string | Error, trace?: string | Error, context?: string): void {
    let errorMessage: string;
    let errorStack: string | undefined;
    let errorMeta: ErrorLogMetadata;

    // Handle different parameter combinations
    if (message instanceof Error) {
      errorMessage = message.message;
      errorStack = message.stack;
      errorMeta = {
        ...this.buildMetadata(context),
        error: true,
        stack: errorStack,
        originalError: formatErrorForLogging(message),
      };
    } else if (typeof trace === 'string') {
      errorMessage = message;
      errorStack = trace;
      errorMeta = {
        ...this.buildMetadata(context),
        error: true,
        stack: errorStack,
      };
    } else if (trace instanceof Error) {
      errorMessage = message;
      errorStack = trace.stack;
      errorMeta = {
        ...this.buildMetadata(context),
        error: true,
        stack: errorStack,
        originalError: formatErrorForLogging(trace),
      };
    } else {
      errorMessage = message;
      errorMeta = {
        ...this.buildMetadata(context),
        error: true,
      };
    }

    this.logger.error(errorMessage, errorMeta);
  }

  warn(message: string, context?: string | LogMetadata): void {
    const meta = this.buildMetadata(context);
    this.logger.warn(message, meta);
  }

  debug(message: string, context?: string | LogMetadata): void {
    const meta = this.buildMetadata(context);
    this.logger.debug(message, meta);
  }

  verbose(message: string, context?: string | LogMetadata): void {
    const meta = this.buildMetadata(context);
    this.logger.verbose(message, meta);
  }

  /**
   * Custom method for HTTP logging
   */
  http(message: string, meta?: Partial<HttpLogMetadata>): void {
    const context = this.tenantContext.getContext();
    const logMeta: HttpLogMetadata = {
      ...meta,
      context: this.context,
      tenantId: context?.tenantId,
      userId: context?.userId,
      requestId: context?.requestId,
    };
    this.logger.http(message, logMeta);
  }

  /**
   * Custom method for audit logging
   */
  audit(action: string, entity: string, entityId: string, meta?: Partial<AuditLogMetadata>): void {
    const context = this.tenantContext.getContext();
    const logMeta: AuditLogMetadata = {
      audit: true,
      action,
      entity,
      entityId,
      ...meta,
      context: this.context,
      tenantId: context?.tenantId,
      userId: context?.userId,
      requestId: context?.requestId,
    };
    this.logger.info('Audit log', logMeta);
  }

  /**
   * Custom method for security logging
   */
  security(event: string, meta?: Partial<SecurityLogMetadata>): void {
    const context = this.tenantContext.getContext();
    const logMeta: SecurityLogMetadata = {
      security: true,
      event,
      ...meta,
      context: this.context,
      tenantId: context?.tenantId,
      userId: context?.userId,
      requestId: context?.requestId,
    };
    this.logger.warn('Security event', logMeta);
  }

  /**
   * Custom method for performance logging
   */
  performance(operation: string, duration: number, meta?: Partial<PerformanceLogMetadata>): void {
    const context = this.tenantContext.getContext();
    const logMeta: PerformanceLogMetadata = {
      performance: true,
      operation,
      duration,
      ...meta,
      context: this.context,
      tenantId: context?.tenantId,
      userId: context?.userId,
      requestId: context?.requestId,
    };
    this.logger.info('Performance metric', logMeta);
  }

  private buildMetadata(contextOrMeta?: string | LogMetadata): LogMetadata {
    const tenantContext = this.tenantContext.getContext();
    const baseMetadata: LogMetadata = {
      context: this.context,
      tenantId: tenantContext?.tenantId,
      userId: tenantContext?.userId,
      requestId: tenantContext?.requestId,
      timestamp: new Date().toISOString(),
    };

    if (typeof contextOrMeta === 'string') {
      return { ...baseMetadata, context: contextOrMeta };
    } else if (contextOrMeta) {
      return { ...baseMetadata, ...contextOrMeta };
    }

    return baseMetadata;
  }
}