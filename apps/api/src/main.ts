import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TenantContextService } from './modules/tenant/tenant-context.service';
import { LoggerService } from './common/logger/logger.service';
import { validateEnvironment } from './config/validate-env';

// Validate environment variables before starting the application
validateEnvironment();

async function bootstrap() {
  // Add console log to debug startup
  console.log('[API] Starting NestJS application...');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'], // Enable basic logging during startup
  });

  // Get services
  const tenantContext = app.get(TenantContextService);
  
  // LoggerService is transient scoped, so we need to resolve it
  const loggerService = await app.resolve(LoggerService);
  loggerService.setContext('Main');

  // Set custom logger
  app.useLogger(loggerService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3002'],
    credentials: true,
  });

  // Compression
  app.use(compression({
    threshold: 0,
    level: 6,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }));

  // Global filters and interceptors
  app.useGlobalFilters(new AllExceptionsFilter(tenantContext));
  app.useGlobalInterceptors(new LoggingInterceptor(tenantContext));

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API prefix with exclusions for root routes
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'api'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('MADFAM Quoting API')
    .setDescription(`
      Digital fabrication quoting system API for 3D printing, CNC machining, and laser cutting services.
      
      ## Authentication
      Most endpoints require JWT authentication. Use the /auth/login endpoint to obtain tokens.
      
      ## Multi-Tenancy
      This API supports multi-tenant operations. Include the X-Tenant-ID header for tenant-specific requests.
      
      ## API Versioning
      All endpoints are versioned under /api/v1
      
      ## Rate Limiting
      API requests are rate-limited to prevent abuse. See individual endpoint documentation for limits.
    `)
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .addApiKey({ 
      type: 'apiKey', 
      name: 'X-Tenant-ID', 
      in: 'header',
      description: 'Tenant identifier for multi-tenant operations' 
    })
    .addTag('auth', 'Authentication endpoints')
    .addTag('quotes', 'Quote creation and management')
    .addTag('files', 'File upload and management')
    .addTag('pricing', 'Pricing calculations')
    .addTag('jobs', 'Background job management')
    .addTag('audit', 'Audit log access')
    .addTag('cache', 'Cache management')
    .addTag('admin', 'Administrative operations')
    .setContact('MADFAM Support', 'https://madfam.io', 'innovacionesmadfam@proton.me')
    .setLicense('Proprietary', 'https://madfam.io/license')
    .addServer('http://localhost:4000', 'Local Development')
    .addServer('https://api.staging.cotiza.studio', 'Staging')
    .addServer('https://api.cotiza.studio', 'Production')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable shutdown hooks
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = process.env.PORT || 4000;
  console.log(`[API] Starting server on port ${port}...`);
  await app.listen(port);
  
  console.log(`[API] Server started successfully on port ${port}!`);
  loggerService.log(`API server running on http://localhost:${port}`);
  loggerService.log(`Swagger docs available at http://localhost:${port}/api/docs`);
  loggerService.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();