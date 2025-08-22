# MADFAM Development Scripts

This directory contains orchestration scripts for managing the MADFAM development environment.

## Scripts

### dev-start.js
The main development environment orchestrator that handles:
- Checking and starting required services (PostgreSQL, Redis)
- Verifying Node.js version requirements
- Installing missing dependencies
- Checking database connection and migrations
- Clearing ports if they're already in use
- Starting all applications with proper error handling
- Graceful shutdown on exit

Usage:
```bash
npm run dev
```

### health-check.js
Comprehensive health checking tool that verifies:
- All services are running and accessible
- Required environment variables are set
- Database is connected and migrations are up to date
- API endpoints are responding
- System resources (disk space, memory)
- Performance metrics (response times)

Usage:
```bash
npm run health
```

## Features

### Automatic Recovery
- Services that crash are automatically restarted after 5 seconds
- Processes stuck on ports are automatically killed
- Missing dependencies are automatically installed

### Clear Error Messages
- Provides specific instructions for fixing common issues
- Shows installation commands for missing services
- Highlights missing environment variables

### Graceful Shutdown
- Properly stops all child processes on exit
- Handles SIGTERM, SIGINT, and SIGUSR2 signals
- Ensures no orphaned processes are left running

### Port Management
The orchestrator manages these ports:
- API Server: 4000
- Web Application: 3002
- PostgreSQL: 5432
- Redis: 6379

### Environment Variables
The scripts check for these required variables:
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- NEXTAUTH_SECRET

And these optional variables:
- S3_BUCKET
- STRIPE_KEY
- DEFAULT_CURRENCY

## Troubleshooting

### PostgreSQL Issues
If PostgreSQL is not running:
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb madfam_dev
```

### Redis Issues
If Redis is not running:
```bash
# Install Redis
brew install redis

# Start Redis
brew services start redis
```

### Port Already in Use
The orchestrator will automatically kill processes on required ports, but if you need to do it manually:
```bash
# Find process on port
lsof -ti:4000

# Kill process
kill -9 <PID>
```

### Missing Environment Variables
Create a `.env` file in the project root:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/madfam_dev"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
```

## Advanced Usage

### Run without orchestration
To run the raw turbo dev command without checks:
```bash
npm run dev:raw
```

### Debug Mode
Enable debug logging:
```bash
DEBUG=1 npm run dev
```

### Custom Timeouts
The scripts use these default timeouts:
- Service start: 30 seconds
- Health check: 5 seconds
- Graceful shutdown: 10 seconds

These can be modified in the CONFIG object in dev-start.js if needed.