-- Critical Performance Indexes for MADFAM Quoting System

-- Quote search optimization (most common query pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotes_search 
  ON "Quote"("tenantId", "status", "createdAt" DESC) 
  WHERE "deletedAt" IS NULL;

-- Quote number generation optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quotes_tenant_created 
  ON "Quote"("tenantId", "createdAt" DESC);

-- Quote items pricing lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quote_items_quote_prices 
  ON "QuoteItem"("quoteId") 
  INCLUDE ("unitPrice", "totalPrice", "quantity");

-- Material lookup optimization (used in every quote)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_materials_lookup 
  ON "Material"("tenantId", "process", "code") 
  WHERE "active" = true;

-- Machine availability lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_machines_process_active 
  ON "Machine"("tenantId", "process") 
  WHERE "active" = true;

-- Payment intent status tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_intent_status 
  ON "PaymentIntent"("tenantId", "status", "createdAt" DESC);

-- File analysis lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_file_analysis_file 
  ON "FileAnalysis"("fileId", "tenantId");

-- Audit log date range queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_date 
  ON "AuditLog"("tenantId", "at" DESC)
  WHERE "at" > CURRENT_DATE - INTERVAL '90 days';

-- User email lookup (for login)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower 
  ON "User"(LOWER("email"));

-- Session validation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_expires 
  ON "Session"("userId", "expiresAt") 
  WHERE "expiresAt" > CURRENT_TIMESTAMP;

-- Guest session tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guest_sessions_expires 
  ON "GuestSession"("expiresAt") 
  WHERE "convertedAt" IS NULL;

-- Add table statistics for query planner
ANALYZE "Quote";
ANALYZE "QuoteItem";
ANALYZE "Material";
ANALYZE "Machine";
ANALYZE "User";
ANALYZE "Session";