# MADFAM Quoting MVP

A multi-tenant automated quoting system for digital fabrication services including 3D printing (FFF/SLA), CNC machining, and laser cutting.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development environment
docker-compose up -d
npm run dev

# Access applications
# API: http://localhost:4000
# Web: http://localhost:3002
# API Docs: http://localhost:4000/api/docs
```

## 📋 Features

- **Multi-Process Support**: 3D printing (FFF/SLA), CNC machining, 2D laser cutting
- **Automated Pricing**: Real-time cost calculation with material, machine, labor, and overhead factors
- **DFM Analysis**: Geometry validation and manufacturability checking
- **Multi-Tenant**: Complete tenant isolation with row-level security
- **Internationalization**: Spanish/English support with locale-based pricing
- **Payment Integration**: Stripe payment processing with PCI compliance
- **Sustainability Scoring**: CO₂e tracking and environmental impact metrics
- **Volume Discounts**: Automatic quantity-based pricing tiers
- **Rush Orders**: Expedited manufacturing with dynamic pricing

## 🏗 Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, React Query
- **Backend**: NestJS, TypeScript, Prisma ORM, REST API with OpenAPI
- **Worker**: Python (FastAPI) for geometry analysis and DFM
- **Database**: PostgreSQL 14+ with row-level security
- **Queue/Cache**: AWS SQS for job processing, Redis for caching
- **Storage**: AWS S3 with KMS encryption for files
- **Infrastructure**: Docker, AWS ECS Fargate, Terraform IaC

### Project Structure

```
├── apps/
│   ├── api/             # NestJS backend API (port 4000)
│   ├── web/             # Next.js frontend (port 3002)
│   ├── worker/          # Python geometry analyzer
│   └── admin/           # Admin dashboard (placeholder)
├── packages/
│   ├── pricing-engine/  # Core pricing calculations
│   ├── shared/          # Shared types and utilities
│   └── ui/              # Shared UI components
├── infrastructure/      # Terraform modules
└── docker-compose.yml   # Local development
```

## 🔧 Development

### Prerequisites

- Node.js 18+ and npm 9+
- Python 3.9+
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose
- AWS CLI (for S3 operations)

### Environment Setup

1. **Clone and install**:

```bash
git clone https://github.com/madfam-io/digifab-quoting.git
cd digifab-quoting
npm install
```

2. **Configure environment**:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

3. **Required environment variables**:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/madfam_quoting

# Redis
REDIS_URL=redis://localhost:6379

# AWS
S3_BUCKET=madfam-quoting-dev
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# Auth
JWT_SECRET=your-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3002

# Stripe
STRIPE_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Locale
DEFAULT_CURRENCY=MXN
SUPPORTED_CURRENCIES=MXN,USD
DEFAULT_LOCALE=es
```

4. **Database setup**:

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### Development Commands

```bash
# Start all services
npm run dev

# Run specific app
npm run dev -- --filter=@madfam/api
npm run dev -- --filter=@madfam/web

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema changes (dev)
npm run db:migrate    # Run migrations
npm run db:studio     # Open Prisma Studio
npm run db:seed       # Seed initial data

# Testing
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage report
npm run test:e2e      # E2E tests

# Code quality
npm run lint          # ESLint
npm run format        # Prettier
npm run typecheck     # TypeScript check

# Build
npm run build         # Build all packages
npm run clean         # Clean build artifacts
```

### Default Test Users

- **Admin**: `admin@madfam.io` / `Admin123!`
- **Manager**: `manager@madfam.io` / `Manager123!`
- **Customer**: `customer@example.com` / `Customer123!`

## 🧪 Testing

### Test Structure

```
src/
├── __tests__/           # Unit tests
├── integration/         # Integration tests
└── e2e/                # End-to-end tests
```

### Running Tests

```bash
# Unit tests
npm test

# Test specific package
npm test -- --filter=@madfam/pricing-engine

# Coverage report
npm test -- --coverage

# Watch mode
npm test:watch

# E2E tests
npm run test:e2e
```

### Test Coverage Targets

- Statements: 80%+
- Branches: 75%+
- Functions: 90%+
- Lines: 80%+

## 📦 API Documentation

### Base URL

```
Development: http://localhost:4000/api/v1
Production: https://api.madfam.io/v1
```

### Authentication

JWT Bearer token authentication:

```bash
# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use token
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/v1/quotes
```

### Key Endpoints

#### Authentication

- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and invalidate tokens

#### Quotes

- `POST /quotes/upload` - Upload files for quoting
- `POST /quotes` - Create quote from uploaded files
- `GET /quotes` - List quotes (paginated)
- `GET /quotes/{id}` - Get quote details
- `POST /quotes/{id}/accept` - Accept quote
- `GET /quotes/{id}/pdf` - Download quote PDF

#### Quote Items

- `GET /quotes/{id}/items` - List quote items
- `PUT /quotes/{id}/items/{itemId}` - Update item selections
- `POST /quotes/{id}/items/{itemId}/recalculate` - Recalculate pricing

#### Orders

- `GET /orders` - List orders
- `GET /orders/{id}` - Get order details
- `PUT /orders/{id}/status` - Update order status
- `GET /orders/{id}/tracking` - Get tracking info

#### Payment

- `POST /payment/session` - Create Stripe checkout session
- `POST /payment/webhook` - Stripe webhook handler
- `GET /payment/history` - Payment history

#### Files

- `POST /files/upload` - Get presigned upload URL
- `GET /files/{id}/download` - Get presigned download URL
- `DELETE /files/{id}` - Delete file

#### Admin

- `GET /admin/materials` - List materials
- `POST /admin/materials` - Create material
- `PUT /admin/materials/{id}` - Update material
- `GET /admin/machines` - List machines
- `POST /admin/machines` - Create machine
- `PUT /admin/machines/{id}` - Update machine
- `GET /admin/reports` - Generate reports

### Rate Limiting

- Anonymous: 10 req/min
- Authenticated: 100 req/min
- Quote creation: 20 req/min
- File upload: 50 req/day

### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": ["error message"]
    }
  },
  "meta": {
    "timestamp": "2024-01-20T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

## 🏭 Pricing Engine

### Calculation Components

1. **Material Cost**: Volume × Density × Price/kg
2. **Machine Cost**: Processing time × Hourly rate
3. **Energy Cost**: Power consumption × Time × Tariff
4. **Labor Cost**: Setup + Post-processing time × Rate
5. **Overhead**: Configurable percentage (default 15%)
6. **Margin**: Minimum floor enforcement (default 30%)
7. **Volume Discounts**: Quantity-based tiers
8. **Rush Upcharge**: Time-based expedite fees

### Process-Specific Features

#### 3D Printing (FFF)

- Layer height impact on time
- Infill percentage calculations
- Support material estimation
- Build volume validation

#### 3D Printing (SLA)

- Resin volume with tank minimums
- Layer exposure time
- Post-processing (wash, cure)
- Support structure calculations

#### CNC Machining

- Material removal rate (MRR)
- Tool wear calculations
- Tolerance-based pricing
- Feature complexity factors

#### Laser Cutting

- Cut length and pierce count
- Material thickness factors
- Nesting efficiency
- Assist gas consumption

## 🚀 Deployment

### Docker Build

```bash
# Build all images
docker build -t madfam-api -f apps/api/Dockerfile .
docker build -t madfam-web -f apps/web/Dockerfile .
docker build -t madfam-worker -f apps/worker/Dockerfile .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### AWS Infrastructure

Infrastructure managed with Terraform:

```bash
cd infrastructure/terraform/environments/prod
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

### CI/CD Pipeline

GitHub Actions workflow:

1. Run tests and linting
2. Build Docker images
3. Push to Amazon ECR
4. Deploy to ECS Fargate
5. Run smoke tests

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up Redis cluster
- [ ] Configure S3 bucket and KMS
- [ ] Set Stripe production keys
- [ ] Configure domain and SSL
- [ ] Set up CloudWatch monitoring
- [ ] Configure backup strategy
- [ ] Test payment webhooks
- [ ] Verify email sending

## 🔒 Security

### Authentication & Authorization

- JWT with refresh token rotation
- Role-based access control (Admin, Manager, Operator, Customer)
- API key authentication for service-to-service
- Session invalidation on logout

### Data Protection

- TLS 1.2+ for all connections
- AES-256 encryption at rest (S3/RDS)
- KMS key rotation
- PCI DSS compliance for payments

### Multi-Tenant Security

- Row-level security in PostgreSQL
- Tenant context validation
- Isolated S3 prefixes per tenant
- Separate encryption keys

### API Security

- Input validation with Zod schemas
- SQL injection prevention (Prisma)
- XSS protection
- CORS configuration
- Rate limiting
- Request size limits

## 📊 Monitoring & Observability

### Health Checks

```bash
GET /health
GET /health/live
GET /health/ready
```

### Metrics

- API latency (p50, p95, p99)
- Error rates by endpoint
- Queue depth and processing time
- Database connection pool
- Cache hit rates

### Logging

- Structured JSON logs
- Correlation IDs
- Request/response logging
- Error stack traces
- Audit trail for admin actions

### Alerts

- API error rate > 1%
- Response time > 1s (p95)
- Queue depth > 1000
- Database connections > 80%
- Disk usage > 80%

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch from `develop`
3. Write tests for new features
4. Ensure all tests pass
5. Update documentation
6. Submit pull request

### Code Standards

- TypeScript strict mode
- ESLint + Prettier formatting
- Conventional commits
- 80%+ test coverage
- API documentation

### Commit Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

## 🐛 Troubleshooting

### Common Issues

**Database connection errors**

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
psql $DATABASE_URL
```

**Redis connection errors**

```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
```

**S3 upload failures**

```bash
# Check AWS credentials
aws s3 ls s3://$S3_BUCKET

# Verify CORS configuration
aws s3api get-bucket-cors --bucket $S3_BUCKET
```

**Build failures**

```bash
# Clear cache and reinstall
npm run clean
rm -rf node_modules
npm install
```

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- Documentation: [https://docs.madfam.io](https://docs.madfam.io)
- Email: support@madfam.io
- Issues: [GitHub Issues](https://github.com/madfam-io/digifab-quoting/issues)
