# MADFAM Quoting MVP

A multi-tenant digital fabrication quoting system supporting 3D printing, CNC machining, and laser cutting services.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL 15+ (if running without Docker)
- Redis 7+ (if running without Docker)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digifab-quoting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the database (if not using external PostgreSQL)**
   ```bash
   # Using Docker
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres --name postgres postgres:14
   ```

5. **Set up the database**
   ```bash
   # Generate Prisma client
   cd apps/api
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Seed initial data
   npm run db:seed
   cd ../..
   ```

6. **Start the development environment**
   ```bash
   # From root directory
   npm run dev
   ```

7. **Access the applications**
   - API: http://localhost:3001
   - API Docs: http://localhost:3001/api/docs
   - Web App: http://localhost:3000
   - Worker API: http://localhost:8000

### Default Test Users
- **Admin**: `admin@madfam.io` / `admin123`
- **Customer**: `test@example.com` / `test123`

## 📁 Project Structure

```
.
├── apps/
│   ├── api/          # NestJS backend API
│   ├── web/          # Next.js frontend
│   ├── worker/       # Python geometry processor
│   └── admin/        # Admin dashboard
├── packages/
│   ├── shared/       # Shared TypeScript types & schemas
│   ├── ui/           # Shared UI components
│   └── pricing-engine/ # Core pricing logic
├── infrastructure/
│   ├── terraform/    # Infrastructure as Code
│   └── k8s/         # Kubernetes manifests
└── docs/            # Documentation
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL, Redis
- **Queue**: AWS SQS
- **Storage**: AWS S3
- **Worker**: Python, FastAPI
- **Infrastructure**: Docker, Kubernetes, AWS

## 📚 Documentation

- [API Documentation](http://localhost:4000/api/docs)
- [Architecture Overview](docs/architecture.md)
- [Development Guide](docs/development.md)
- [Deployment Guide](docs/deployment.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

## 🚢 Deployment

### Production Build

```bash
# Build all applications
npm run build

# Build specific app
npm run build -- --filter=@madfam/api
```

### Docker Production Images

```bash
# Build production images
docker build -t madfam-api -f apps/api/Dockerfile .
docker build -t madfam-web -f apps/web/Dockerfile .
docker build -t madfam-worker -f apps/worker/Dockerfile .
```

## 📋 Available Scripts

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps for production
- `npm run test` - Run tests across all apps
- `npm run lint` - Lint all code
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean all build artifacts
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data

## 🔐 Security

- All API endpoints require authentication (except health checks)
- Multi-tenant architecture with row-level security
- Rate limiting enabled on all endpoints
- Input validation using Zod schemas
- Audit logging for all sensitive operations

## 🤝 Contributing

1. Create a feature branch from `develop`
2. Make your changes following the coding standards
3. Write/update tests as needed
4. Submit a pull request with a clear description

## 📄 License

This project is proprietary and confidential.