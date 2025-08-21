#!/bin/bash

echo "🔍 Testing MADFAM Quoting MVP setup..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test Docker
echo -n "Docker: "
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    exit 1
fi

# Test PostgreSQL
echo -n "PostgreSQL: "
if docker exec madfam-postgres pg_isready > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

# Test Redis
echo -n "Redis: "
if docker exec madfam-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

# Test Database Connection
echo -n "Database Tables: "
TABLE_COUNT=$(PGPASSWORD=postgres psql -h localhost -U postgres -d madfam_quoting -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null | tr -d ' ')
if [ "$TABLE_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✓ ($TABLE_COUNT tables)${NC}"
else
    echo -e "${YELLOW}⚠ No tables found${NC}"
fi

# Test if seeded
echo -n "Database Seeded: "
USER_COUNT=$(PGPASSWORD=postgres psql -h localhost -U postgres -d madfam_quoting -t -c "SELECT COUNT(*) FROM \"User\"" 2>/dev/null | tr -d ' ')
if [ "$USER_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✓ ($USER_COUNT users)${NC}"
else
    echo -e "${YELLOW}⚠ No users found${NC}"
fi

echo ""
echo "Ready to start? Run: ./start-local.sh"