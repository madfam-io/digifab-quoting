import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);
  private initialized = false;

  constructor(private readonly configService: ConfigService) {
    this.initialize();
  }

  private initialize() {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    if (!dsn) {
      this.logger.warn('Sentry DSN not configured, monitoring disabled');
      return;
    }

    const environment = this.configService.get<string>('NODE_ENV', 'development');
    const release = this.configService.get<string>('APP_VERSION');
    const isProduction = environment === 'production';

    Sentry.init({
      dsn,
      environment,
      release,
      
      // Performance monitoring
      tracesSampleRate: isProduction ? 0.1 : 1.0,
      
      // Profiling
      profilesSampleRate: isProduction ? 0.01 : 0.1,
      
      // Integrations
      integrations: [
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
        Sentry.postgresIntegration(),
        Sentry.redisIntegration(),
        nodeProfilingIntegration(),
      ],
      
      // Initial scope
      initialScope: {
        tags: {
          component: 'backend',
          platform: 'node',
          service: 'api',
        },
      },
      
      // Error filtering
      beforeSend: (event, _hint) => {
        // Filter out expected errors
        if (event.exception?.values?.[0]?.type === 'ValidationException') {
          return null;
        }
        
        // Sanitize sensitive data
        if (event.request) {
          this.sanitizeRequestData(event.request);
        }
        
        return event;
      },
      
      // Breadcrumb filtering
      beforeBreadcrumb: (breadcrumb) => {
        // Filter out sensitive HTTP data
        if (breadcrumb.category === 'http' && breadcrumb.data?.url?.includes('/auth/')) {
          breadcrumb.data.url = '[Sanitized Auth URL]';
        }
        
        return breadcrumb;
      },
    });

    this.initialized = true;
    this.logger.log('Sentry monitoring initialized');
  }

  private sanitizeRequestData(request: any) {
    // Remove sensitive headers
    if (request.headers) {
      const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
      sensitiveHeaders.forEach(header => {
        if (request.headers[header]) {
          request.headers[header] = '[Sanitized]';
        }
      });
    }

    // Remove sensitive query parameters
    if (request.query_string) {
      const sensitiveParams = ['token', 'api_key', 'password', 'secret'];
      sensitiveParams.forEach(param => {
        if (request.query_string.includes(param)) {
          request.query_string = request.query_string.replace(
            new RegExp(`${param}=[^&]*`, 'gi'),
            `${param}=[Sanitized]`
          );
        }
      });
    }

    // Remove sensitive body data
    if (request.data && typeof request.data === 'object') {
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey'];
      this.sanitizeObject(request.data, sensitiveFields);
    }
  }

  private sanitizeObject(obj: any, sensitiveFields: string[]) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          obj[key] = '[Sanitized]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.sanitizeObject(obj[key], sensitiveFields);
        }
      }
    }
  }

  captureException(error: Error, context?: Record<string, any>) {
    if (!this.initialized) return;

    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
    if (!this.initialized) return;

    Sentry.withScope((scope) => {
      scope.setLevel(level);
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      Sentry.captureMessage(message);
    });
  }

  addBreadcrumb(message: string, category?: string, level?: Sentry.SeverityLevel, data?: any) {
    if (!this.initialized) return;

    Sentry.addBreadcrumb({
      message,
      category: category || 'custom',
      level: level || 'info',
      data,
      timestamp: Date.now() / 1000,
    });
  }

  setUser(user: { id: string; email?: string; username?: string; tenantId?: string }) {
    if (!this.initialized) return;

    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      tenant_id: user.tenantId,
    });
  }

  setTag(key: string, value: string) {
    if (!this.initialized) return;
    Sentry.setTag(key, value);
  }

  setContext(key: string, context: Record<string, any>) {
    if (!this.initialized) return;
    Sentry.setContext(key, context);
  }

  startTransaction(_name: string, _operation?: string) {
    if (!this.initialized) return null;

    // Updated for Sentry v8 - create a simple transaction-like object
    return {
      setStatus: (_status: string) => {},
      finish: () => {},
      setTag: (_key: string, _value: string) => {},
      setData: (_key: string, _value: any) => {},
    };
  }

  // Middleware for automatic request monitoring
  getRequestMiddleware() {
    if (!this.initialized) {
      return (_req: any, _res: any, next: any) => next();
    }

    // Updated for Sentry v8 - middleware is handled by integration
    return (_req: any, _res: any, next: any) => next();
  }

  getTracingMiddleware() {
    if (!this.initialized) {
      return (_req: any, _res: any, next: any) => next();
    }

    // Tracing is now handled automatically in Sentry v8
    return (_req: any, _res: any, next: any) => next();
  }

  getErrorHandler() {
    if (!this.initialized) {
      return (error: any, _req: any, _res: any, next: any) => next(error);
    }

    return (error: any, __req: any, __res: any, next: any) => {
      // Manually capture errors for Sentry v8
      if (error?.statusCode >= 500) {
        Sentry.captureException(error);
      }
      next(error);
    };
  }

  // Performance monitoring helpers
  measureAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    name: string,
    operation: string = 'function'
  ): T {
    return (async (...args: any[]) => {
      if (!this.initialized) {
        return fn(...args);
      }

      const transaction = this.startTransaction(name, operation);
      
      try {
        const result = await fn(...args);
        transaction?.setStatus('ok');
        return result;
      } catch (error) {
        transaction?.setStatus('internal_error');
        this.captureException(error as Error, { function: name });
        throw error;
      } finally {
        transaction?.finish();
      }
    }) as T;
  }

  measureFunction<T extends (...args: any[]) => any>(
    fn: T,
    name: string,
    operation: string = 'function'
  ): T {
    return ((...args: any[]) => {
      if (!this.initialized) {
        return fn(...args);
      }

      const transaction = this.startTransaction(name, operation);
      
      try {
        const result = fn(...args);
        transaction?.setStatus('ok');
        return result;
      } catch (error) {
        transaction?.setStatus('internal_error');
        this.captureException(error as Error, { function: name });
        throw error;
      } finally {
        transaction?.finish();
      }
    }) as T;
  }

  // Health check
  isHealthy(): boolean {
    return this.initialized;
  }

  // Flush all pending events
  async flush(timeout: number = 2000): Promise<boolean> {
    if (!this.initialized) return true;
    
    try {
      return await Sentry.flush(timeout);
    } catch (error) {
      this.logger.error('Failed to flush Sentry events', error);
      return false;
    }
  }
}