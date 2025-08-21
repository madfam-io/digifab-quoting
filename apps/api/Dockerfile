FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy workspace packages
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install dependencies
RUN npm ci

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

WORKDIR /app

# Build the application
RUN npm run build -- --filter=@madfam/api...

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY turbo.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma

# Install production dependencies
RUN npm ci --production

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["node", "dist/main.js"]