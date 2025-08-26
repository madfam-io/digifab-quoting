# Troubleshooting Guide

Common issues and solutions for the Cotiza Studio development environment.

## Table of Contents

- [Startup Issues](#startup-issues)
- [Port Conflicts](#port-conflicts)
- [Database Issues](#database-issues)
- [Redis Issues](#redis-issues)
- [Environment Variables](#environment-variables)
- [Performance Issues](#performance-issues)
- [Build Errors](#build-errors)

## Startup Issues

### Error: "PostgreSQL is not available"

**Solution:**

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql
sudo systemctl start postgresql

# Create database
createdb madfam_dev
```

### Error: "Redis is not available"

**Solution:**

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
```

### Error: "Node.js 18.0.0 or higher is required"

**Solution:**

```bash
# Install Node.js 18+ using nvm
nvm install 18
nvm use 18

# Or download from nodejs.org
```

## Port Conflicts

### Error: "Port 4000 is in use"

The orchestrator should handle this automatically, but if needed:

```bash
# Find process using port
lsof -ti:4000

# Kill process
kill -9 $(lsof -ti:4000)
```

### Error: "Port 3002 is in use"

```bash
# Find and kill process
kill -9 $(lsof -ti:3002)
```

## Database Issues

### Error: "Database connection failed"

**Check PostgreSQL is running:**

```bash
pg_isready
```

**Check DATABASE_URL in .env.local:**

```
DATABASE_URL="postgresql://username:password@localhost:5432/madfam_dev"
```

### Error: "Migrations are pending"

**Run migrations:**

```bash
npm run db:migrate
```

### Error: "Database does not exist"

**Create database:**

```bash
createdb madfam_dev
```

### Error: "Permission denied for schema public"

**Grant permissions:**

```sql
psql madfam_dev
GRANT ALL ON SCHEMA public TO your_username;
```

## Redis Issues

### Error: "Could not connect to Redis"

**Check Redis is running:**

```bash
redis-cli ping
# Should return "PONG"
```

**Check REDIS_URL in .env.local:**

```
REDIS_URL="redis://localhost:6379"
```

### Error: "Redis connection timeout"

**Restart Redis:**

```bash
# macOS
brew services restart redis

# Linux
sudo systemctl restart redis
```

## Environment Variables

### Error: "Missing environment variables"

**Create .env.local with required variables:**

```bash
# Run setup wizard
npm run setup

# Or create manually
cp .env.example .env.local
# Edit .env.local with your values
```

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT tokens
- `NEXTAUTH_SECRET` - Secret for NextAuth

## Performance Issues

### Slow startup times

**Solutions:**

1. Check disk space: `df -h`
2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Increase Node.js memory:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run dev
   ```

### High memory usage

**Check for memory leaks:**

```bash
npm run health
```

**Restart services:**

```bash
# Stop all services
Ctrl+C

# Start again
npm run dev
```

## Build Errors

### Error: "Module not found"

**Solutions:**

```bash
# Regenerate Prisma client
npm run db:generate

# Clear cache and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

### Error: "TypeScript errors"

**Solutions:**

```bash
# Check for type errors
npm run typecheck

# Update dependencies
npm update
```

### Error: "Turbo cache issues"

**Clear Turbo cache:**

```bash
rm -rf .turbo
npm run clean
```

## Debug Mode

Enable verbose logging to diagnose issues:

```bash
DEBUG=1 npm run dev
```

## Getting Help

1. Run health check: `npm run health`
2. Check logs: `tail -f apps/api/api.log`
3. View all available commands: `npm run help`
4. Check scripts documentation: `scripts/README.md`

## Resetting Everything

If all else fails, reset your environment:

```bash
# Stop all services
npm run dev # Then Ctrl+C

# Reset database
npm run db:utils reset

# Clean everything
npm run clean
rm -rf node_modules package-lock.json

# Reinstall and setup
npm install
npm run setup
```
