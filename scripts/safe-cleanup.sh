#!/bin/bash

# Safe Cleanup Script - Performs targeted cleanup operations

set -e

echo "🧹 Starting Safe Cleanup..."
echo "=========================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Remove log files
echo "📄 Removing log files..."
find . -name "*.log" -not -path "./node_modules/*" -not -path "./.git/*" -print -delete

# 2. Remove .turbo directories
echo "📁 Removing .turbo cache directories..."
find . -name ".turbo" -type d -not -path "./node_modules/*" -exec rm -rf {} + 2>/dev/null || true

# 3. Remove specific temporary files
echo "🗑️  Removing temporary files..."
rm -f apps/api/build_output.txt
rm -rf apps/api/dist-debug
rm -f apps/api/prisma/schema.prisma.backup

# 4. Clean up console.log statements (excluding seed and test files)
echo "🔍 Removing console statements from production code..."

# API files (excluding seed.ts)
FILES_TO_CLEAN=(
    "apps/api/src/main.ts"
    "apps/api/src/config/validate-env.ts"
    "apps/api/src/modules/audit/audit.service.ts"
    "apps/web/src/app/quote/new/page.tsx"
    "apps/web/src/app/quote/[id]/configure/page.tsx"
    "apps/web/src/app/quote/[id]/page.tsx"
    "apps/web/src/app/api/auth/[...nextauth]/route.ts"
    "apps/web/src/lib/auth.ts"
)

for file in "${FILES_TO_CLEAN[@]}"; do
    if [ -f "$file" ]; then
        echo "  Cleaning: $file"
        # Remove console.log, console.error, console.warn lines
        sed -i.bak '/console\.\(log\|error\|warn\|debug\)/d' "$file"
        rm -f "${file}.bak"
    fi
done

# 5. Create proper logger for API
echo "📝 Creating logger configuration..."
cat > apps/api/src/common/logger/logger.config.ts << 'EOF'
import { LoggerService } from '@nestjs/common';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export class AppLogger {
  static create(): LoggerService {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('API', {
              colors: isDevelopment,
              prettyPrint: isDevelopment,
            }),
          ),
        }),
      ],
      level: isDevelopment ? 'debug' : 'info',
    });
  }
}
EOF

# 6. Update main.ts to use logger
echo "🔧 Updating main.ts to use logger..."
cat > apps/api/src/main.ts.new << 'EOF'
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnv } from './config/validate-env';
import { AppLogger } from './common/logger/logger.config';

async function bootstrap() {
  // Validate environment variables
  validateEnv();

  // Create app with custom logger
  const logger = AppLogger.create();
  const app = await NestFactory.create(AppModule, { logger });

  // Get config service
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS
  const allowedOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000').split(',');
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API Documentation
  const config = new DocumentBuilder()
    .setTitle('MADFAM Quoting API')
    .setDescription('Multi-tenant quoting system for digital fabrication')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = configService.get<number>('PORT', 4000);
  
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
EOF

mv apps/api/src/main.ts.new apps/api/src/main.ts

# 7. Move duplicate files to archive
echo "📦 Archiving duplicate files..."
mkdir -p .archive/refactored-files
mv apps/api/src/modules/quotes/quotes.service.refactored.ts .archive/refactored-files/ 2>/dev/null || true
mv apps/api/src/modules/files/files.service.improved.ts .archive/refactored-files/ 2>/dev/null || true
mv apps/api/prisma/schema-updates.prisma .archive/refactored-files/ 2>/dev/null || true

# 8. Create TODO summary
echo "📋 Creating TODO summary..."
cat > TODO_SUMMARY.md << 'EOF'
# TODO Summary

## High Priority
- [ ] Get tenant config for quote validity (quotes.service.ts:36)
- [ ] Calculate tax based on tenant configuration (quotes.service.ts:380)
- [ ] Calculate shipping costs (quotes.service.ts:384)
- [ ] Implement token refresh logic (route.ts:74)

## Medium Priority
- [ ] Load tenant settings from database (quotes.service.refactored.ts:461)
- [ ] Implement order creation from quote (quotes.service.refactored.ts:504)
- [ ] Add InvoiceStatus to shared enums (orders.service.ts:6)

## Completed
- [x] Remove console.log statements from production code
- [x] Archive duplicate/refactored files
- [x] Clean build artifacts and logs
- [x] Create proper logger configuration
EOF

# 9. Clean unused imports
echo "🔧 Cleaning unused imports..."
npm run lint -- --fix || true

# 10. Format code
echo "💅 Formatting code..."
npm run format || true

echo ""
echo -e "${GREEN}✅ Safe cleanup complete!${NC}"
echo ""
echo "Summary of changes:"
echo "- Removed all .log files and .turbo directories"
echo "- Cleaned console statements from production code"
echo "- Created proper logger configuration"
echo "- Archived duplicate files to .archive/refactored-files/"
echo "- Created TODO_SUMMARY.md with remaining tasks"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review and test the changes"
echo "2. Run 'npm test' to ensure nothing broke"
echo "3. Check .archive/refactored-files/ and delete if no longer needed"
echo "4. Address TODOs in TODO_SUMMARY.md"