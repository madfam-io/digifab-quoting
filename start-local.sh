#!/bin/bash

echo "🚀 Starting MADFAM Quoting MVP..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo -e "${BLUE}📦 Checking Docker services...${NC}"
docker-compose ps

# Start databases if not running
if ! docker-compose ps | grep -q "healthy"; then
    echo -e "${YELLOW}Starting PostgreSQL and Redis...${NC}"
    docker-compose up -d postgres redis
    echo "Waiting for services to be ready..."
    sleep 10
fi

echo -e "${GREEN}✅ Docker services are ready${NC}"

# Check database connection
echo -e "${BLUE}🔍 Checking database...${NC}"
if PGPASSWORD=postgres psql -h localhost -U postgres -d madfam_quoting -c '\dt' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database is accessible${NC}"
else
    echo -e "${YELLOW}Database not found or empty. Setting up...${NC}"
    cd apps/api
    npx prisma db push
    npx tsx prisma/seed.ts
    cd ../..
fi

# Kill any existing processes on ports
echo -e "${BLUE}🧹 Cleaning up ports...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

# Start the application
echo -e "${GREEN}🚀 Starting development servers...${NC}"
echo ""
echo -e "${YELLOW}Access the applications at:${NC}"
echo -e "  ${BLUE}Web App:${NC} http://localhost:3000"
echo -e "  ${BLUE}API:${NC} http://localhost:4000"
echo -e "  ${BLUE}API Docs:${NC} http://localhost:4000/api/docs"
echo ""
echo -e "${YELLOW}Default credentials:${NC}"
echo -e "  ${BLUE}Admin:${NC} admin@madfam.io / admin123"
echo -e "  ${BLUE}Customer:${NC} test@example.com / test123"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop all services${NC}"
echo ""

# Start the dev server
npm run dev