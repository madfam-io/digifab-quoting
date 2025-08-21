# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MADFAM Quoting MVP is a multi-tenant quoting system for digital fabrication services. The system provides automated quoting for:
- 3D printing (FFF and SLA)
- CNC machining (3-axis for aluminum, steel, and plastics)
- 2D laser cutting

## Commands

### Development Setup
```bash
# Install dependencies
npm install

# Run development server (all apps)
npm run dev

# Run specific app
npm run dev -- --filter=@madfam/api
npm run dev -- --filter=@madfam/web

# Run tests
npm test
npm run test:watch
npm run test:cov
npm run test:e2e

# Linting and formatting
npm run lint
npm run format

# Build for production
npm run build

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema changes (dev)
npm run db:migrate  # Run migrations
npm run db:seed     # Seed initial data

# Clean build artifacts
npm run clean
```

### Docker Commands
```bash
# Build Docker images
docker build -t madfam-frontend ./frontend
docker build -t madfam-backend ./backend
docker build -t madfam-worker ./worker

# Run with docker-compose
docker-compose up -d
docker-compose down
```

### Infrastructure (Terraform)
```bash
# Initialize Terraform
terraform init

# Plan infrastructure changes
terraform plan

# Apply infrastructure changes
terraform apply

# Destroy infrastructure
terraform destroy
```

## Architecture

### Tech Stack
- **Frontend**: Next.js (App Router) with TypeScript, TailwindCSS, shadcn/ui, i18next (ES/EN), React Query
- **Backend**: NestJS with TypeScript, REST API, OpenAPI docs, Zod validation
- **Worker**: Python microservice (FastAPI) for geometry/DFM analysis
- **Database**: PostgreSQL with Prisma ORM
- **Queue/Cache**: AWS SQS for job queuing, Redis for caching
- **Storage**: AWS S3 for file uploads and PDFs
- **Auth**: NextAuth with JWT and refresh tokens
- **Payments**: Stripe for card payments

### Project Structure (expected)
```
/
├── frontend/           # Next.js frontend application
├── backend/            # NestJS API server
├── worker/            # Python geometry analysis service
├── infrastructure/    # Terraform modules
├── shared/            # Shared types and utilities
└── docker-compose.yml # Local development orchestration
```

### Multi-Tenant Architecture
- All database tables include `tenant_id` for row-level security
- Tenant context derived from subdomain or API header
- Per-tenant S3 prefixes and KMS keys
- Prisma middleware enforces tenant isolation

### Key API Endpoints
- `POST /api/v1/quotes/upload` - File upload and presigned URL generation
- `POST /api/v1/quotes` - Create quote from uploaded files
- `GET /api/v1/quotes/{id}` - Get quote details
- `POST /api/v1/quotes/{id}/accept` - Accept quote and proceed to payment
- `GET /api/v1/admin/*` - Admin configuration endpoints (role-protected)

### Environment Variables
Key environment variables required:
```
NODE_ENV
DATABASE_URL
REDIS_URL
S3_BUCKET
S3_REGION
KMS_KEY_ID
JWT_SECRET
NEXTAUTH_SECRET
STRIPE_KEY
STRIPE_WEBHOOK_SECRET
DEFAULT_CURRENCY=MXN
SUPPORTED_CURRENCIES=MXN,USD
DEFAULT_LOCALES=es,en
FX_SOURCE=openexchangerates
```

### Deployment
- **Branches**: `main` (production), `develop` (staging)
- **CI/CD**: GitHub Actions → Docker → ECR → ECS Fargate
- **Environments**: `dev`, `staging`, `prod`
- PR checks include: lint, unit tests, E2E smoke tests

### Performance Targets
- p95 API latency < 400ms
- Auto-quote completion: <60s for 3D/laser, <120s for CNC
- 99.9% availability SLO

### Security Considerations
- RBAC with roles: Admin, Manager, Operator, Support, Customer
- All API endpoints require authentication except public quote viewing
- Audit logging for all configuration changes and sensitive operations
- Encryption in transit (TLS 1.2+) and at rest (S3/KMS)
- Support for NDA acceptance tracking

### Testing Strategy
- Unit tests for pricing calculations, margin enforcement, FX conversion
- Integration tests for file upload → DFM → pricing pipeline
- E2E tests (Playwright) for critical user journeys
- Performance tests for concurrent quote processing

### Development Notes
- Use Prisma migrations for database schema changes
- Feature flags configured in database (e.g., `features.supplier_portal`)
- Bilingual support (ES/EN) using i18next
- Sustainability scoring integrated into all quotes
- Quote validity default: 14 days