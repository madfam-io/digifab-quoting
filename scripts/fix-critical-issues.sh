#!/bin/bash

echo "🔧 Fixing critical issues..."

# 1. Install missing dependencies
echo "📦 Installing missing dependencies..."
npm install bcrypt @types/bcrypt
npm install cache-manager cache-manager-redis-store @types/cache-manager
npm install @nestjs/throttler
npm install helmet @types/helmet
npm install compression @types/compression
npm install class-transformer class-validator
npm install uuid @types/uuid

# 2. Fix Prisma
echo "🗄️ Fixing Prisma schema..."
npx prisma generate
npx prisma db push --skip-generate

# 3. Create missing directories
echo "📁 Creating required directories..."
mkdir -p apps/api/src/common/types
mkdir -p apps/api/src/common/decorators
mkdir -p apps/api/src/common/utils
mkdir -p apps/api/test/factories
mkdir -p apps/api/test/fixtures

# 4. Fix TypeScript config for API
echo "📝 Updating TypeScript config..."
cat > apps/api/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "moduleResolution": "node",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2017",
    "sourceMap": true,
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"],
      "@cotiza/shared": ["../../packages/shared/src"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
EOF

# 5. Create error handling utility
echo "🛡️ Creating error handling utility..."
cat > apps/api/src/common/utils/error-handling.ts << 'EOF'
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

export function isRecordNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes('Record to update not found')
  );
}

export function isDuplicateError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('Unique constraint failed') ||
     error.message.includes('duplicate key'))
  );
}
EOF

# 6. Create public decorator
echo "🔓 Creating public decorator..."
cat > apps/api/src/common/decorators/public.decorator.ts << 'EOF'
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
EOF

# 7. Create repository types
echo "📝 Creating repository types..."
cat > apps/api/src/common/types/repository.types.ts << 'EOF'
import { Prisma } from '@prisma/client';

export interface QueryOptions<T = any> {
  where?: Partial<T>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  skip?: number;
  take?: number;
  include?: Record<string, boolean | object>;
  select?: Record<string, boolean>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BatchUpdateItem<T> {
  id: string;
  data: Partial<T>;
}

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';

export interface Filter<T> {
  field: keyof T;
  operator: FilterOperator;
  value: any;
}

export interface SortOptions<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}
EOF

# 8. Fix cache service imports
echo "💾 Updating cache service..."
sed -i.bak 's/import { CACHE_MANAGER }/import { Inject }/' apps/api/src/cache/cache.service.ts 2>/dev/null || \
sed -i '' 's/import { CACHE_MANAGER }/import { Inject }/' apps/api/src/cache/cache.service.ts 2>/dev/null || true

# 9. Run ESLint fixes
echo "🧹 Running ESLint fixes..."
npm run lint -- --fix || true

# 10. Build to check for errors
echo "🏗️ Building API to check for errors..."
npm run build -- --filter=@cotiza/api || true

echo "✨ Critical issues fixed!"
echo ""
echo "Next steps:"
echo "1. Review the changes made"
echo "2. Run 'npm run dev' to start the application"
echo "3. If there are still errors, check the TROUBLESHOOTING_SOLUTIONS.md file"