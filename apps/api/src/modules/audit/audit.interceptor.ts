import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditService, AuditAction, AuditEntity } from './audit.service';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
  entity: AuditEntity;
  action: AuditAction;
  entityIdParam?: string; // The parameter name containing the entity ID
  includeBody?: boolean; // Whether to include request body in audit
  includeResponse?: boolean; // Whether to include response in audit
  sensitive?: boolean; // Whether the data is sensitive (will be masked)
}

/**
 * Decorator to enable audit logging on a controller method
 */
export const Audit = (metadata: AuditMetadata) => SetMetadata(AUDIT_KEY, metadata);

import { SetMetadata } from '@nestjs/common';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditMetadata>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query, user } = request;

    // Extract entity ID from params
    const entityId = auditMetadata.entityIdParam
      ? params[auditMetadata.entityIdParam]
      : params.id || body?.id || 'unknown';

    // Prepare audit data
    const auditData: any = {
      method,
      url,
      userId: user?.id,
      userEmail: user?.email,
    };

    if (auditMetadata.includeBody && body) {
      auditData.requestBody = this.sanitizeData(body, auditMetadata.sensitive);
    }

    if (query && Object.keys(query).length > 0) {
      auditData.queryParams = query;
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async (response) => {
          const duration = Date.now() - startTime;
          
          const metadata: any = {
            ...auditData,
            duration,
            success: true,
          };

          if (auditMetadata.includeResponse && response) {
            metadata.response = this.sanitizeData(response, auditMetadata.sensitive);
          }

          await this.auditService.logAction(
            auditMetadata.entity,
            entityId,
            auditMetadata.action,
            metadata,
          );
        },
        error: async (error) => {
          const duration = Date.now() - startTime;
          
          await this.auditService.logAction(
            auditMetadata.entity,
            entityId,
            auditMetadata.action,
            {
              ...auditData,
              duration,
              success: false,
              error: {
                name: error.name,
                message: error.message,
                statusCode: error.status,
              },
            },
          );
        },
      }),
    );
  }

  /**
   * Sanitize sensitive data
   */
  private sanitizeData(data: any, sensitive?: boolean): any {
    if (!data) return data;
    
    if (sensitive) {
      return { _masked: true };
    }

    // Clone the data to avoid modifying the original
    const sanitized = JSON.parse(JSON.stringify(data));

    // Remove sensitive fields
    const sensitiveFields = [
      'password',
      'passwordHash',
      'refreshToken',
      'accessToken',
      'apiKey',
      'secret',
      'token',
      'creditCard',
      'cvv',
      'ssn',
    ];

    const removeSensitiveFields = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return;

      for (const key of Object.keys(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '***REDACTED***';
        } else if (typeof obj[key] === 'object') {
          removeSensitiveFields(obj[key]);
        }
      }
    };

    removeSensitiveFields(sanitized);
    return sanitized;
  }
}