# Database Performance Indexes

This document contains the SQL commands to create performance indexes for the MADFAM Quoting MVP database.

## Prerequisites

Ensure your PostgreSQL database is running and accessible before applying these indexes.

## Index Creation SQL

Run the following SQL commands in your PostgreSQL database to create the performance indexes:

```sql
-- User indexes
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_user_tenant_id" ON "User"("tenantId");

-- Quote indexes
CREATE INDEX IF NOT EXISTS "idx_quote_tenant_id" ON "Quote"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_quote_customer_id" ON "Quote"("customerId");
CREATE INDEX IF NOT EXISTS "idx_quote_created_by_id" ON "Quote"("createdById");
CREATE INDEX IF NOT EXISTS "idx_quote_status" ON "Quote"("status");
CREATE INDEX IF NOT EXISTS "idx_quote_valid_until" ON "Quote"("validUntil");
CREATE INDEX IF NOT EXISTS "idx_quote_created_at" ON "Quote"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_quote_tenant_status" ON "Quote"("tenantId", "status");

-- QuoteItem indexes
CREATE INDEX IF NOT EXISTS "idx_quote_item_quote_id" ON "QuoteItem"("quoteId");
CREATE INDEX IF NOT EXISTS "idx_quote_item_file_id" ON "QuoteItem"("fileId");
CREATE INDEX IF NOT EXISTS "idx_quote_item_service" ON "QuoteItem"("service");

-- Customer indexes
CREATE INDEX IF NOT EXISTS "idx_customer_tenant_id" ON "Customer"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_customer_email" ON "Customer"("email");
CREATE INDEX IF NOT EXISTS "idx_customer_company_name" ON "Customer"("companyName");
CREATE INDEX IF NOT EXISTS "idx_customer_created_at" ON "Customer"("createdAt");

-- File indexes
CREATE INDEX IF NOT EXISTS "idx_file_tenant_id" ON "File"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_file_uploaded_by_id" ON "File"("uploadedById");
CREATE INDEX IF NOT EXISTS "idx_file_hash" ON "File"("hash");
CREATE INDEX IF NOT EXISTS "idx_file_created_at" ON "File"("createdAt");

-- Tenant indexes
CREATE INDEX IF NOT EXISTS "idx_tenant_domain" ON "Tenant"("domain");
CREATE INDEX IF NOT EXISTS "idx_tenant_status" ON "Tenant"("status");

-- Material indexes
CREATE INDEX IF NOT EXISTS "idx_material_tenant_id" ON "Material"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_material_service" ON "Material"("service");
CREATE INDEX IF NOT EXISTS "idx_material_code" ON "Material"("code");
CREATE INDEX IF NOT EXISTS "idx_material_active" ON "Material"("active");
CREATE INDEX IF NOT EXISTS "idx_material_tenant_service" ON "Material"("tenantId", "service", "active");

-- Machine indexes
CREATE INDEX IF NOT EXISTS "idx_machine_tenant_id" ON "Machine"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_machine_service" ON "Machine"("service");
CREATE INDEX IF NOT EXISTS "idx_machine_code" ON "Machine"("code");
CREATE INDEX IF NOT EXISTS "idx_machine_active" ON "Machine"("active");
CREATE INDEX IF NOT EXISTS "idx_machine_tenant_service" ON "Machine"("tenantId", "service", "active");

-- ProcessOption indexes
CREATE INDEX IF NOT EXISTS "idx_process_option_tenant_id" ON "ProcessOption"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_process_option_service" ON "ProcessOption"("service");
CREATE INDEX IF NOT EXISTS "idx_process_option_code" ON "ProcessOption"("code");
CREATE INDEX IF NOT EXISTS "idx_process_option_active" ON "ProcessOption"("active");

-- Pricing indexes
CREATE INDEX IF NOT EXISTS "idx_pricing_tenant_id" ON "Pricing"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_pricing_service" ON "Pricing"("service");
CREATE INDEX IF NOT EXISTS "idx_pricing_material_id" ON "Pricing"("materialId");
CREATE INDEX IF NOT EXISTS "idx_pricing_machine_id" ON "Pricing"("machineId");
CREATE INDEX IF NOT EXISTS "idx_pricing_active" ON "Pricing"("active");
CREATE INDEX IF NOT EXISTS "idx_pricing_composite" ON "Pricing"("tenantId", "service", "materialId", "machineId", "active");

-- AuditLog indexes
CREATE INDEX IF NOT EXISTS "idx_audit_log_tenant_id" ON "AuditLog"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_audit_log_entity" ON "AuditLog"("entity");
CREATE INDEX IF NOT EXISTS "idx_audit_log_entity_id" ON "AuditLog"("entityId");
CREATE INDEX IF NOT EXISTS "idx_audit_log_action" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "idx_audit_log_user_id" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "idx_audit_log_created_at" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_audit_log_composite" ON "AuditLog"("tenantId", "entity", "createdAt");

-- Order indexes
CREATE INDEX IF NOT EXISTS "idx_order_tenant_id" ON "Order"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_order_quote_id" ON "Order"("quoteId");
CREATE INDEX IF NOT EXISTS "idx_order_customer_id" ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS "idx_order_status" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "idx_order_created_at" ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_order_payment_status" ON "Order"("paymentStatus");

-- Invoice indexes
CREATE INDEX IF NOT EXISTS "idx_invoice_tenant_id" ON "Invoice"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_invoice_order_id" ON "Invoice"("orderId");
CREATE INDEX IF NOT EXISTS "idx_invoice_status" ON "Invoice"("status");
CREATE INDEX IF NOT EXISTS "idx_invoice_due_date" ON "Invoice"("dueDate");

-- FileAnalysis indexes
CREATE INDEX IF NOT EXISTS "idx_file_analysis_file_id" ON "FileAnalysis"("fileId");
CREATE INDEX IF NOT EXISTS "idx_file_analysis_created_at" ON "FileAnalysis"("createdAt");

-- Report indexes
CREATE INDEX IF NOT EXISTS "idx_report_tenant_id" ON "Report"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_report_type" ON "Report"("type");
CREATE INDEX IF NOT EXISTS "idx_report_entity_type" ON "Report"("entityType");
CREATE INDEX IF NOT EXISTS "idx_report_entity_id" ON "Report"("entityId");
CREATE INDEX IF NOT EXISTS "idx_report_created_by_id" ON "Report"("createdById");
CREATE INDEX IF NOT EXISTS "idx_report_created_at" ON "Report"("createdAt");

-- Text search indexes (PostgreSQL specific)
CREATE INDEX IF NOT EXISTS "idx_customer_search" ON "Customer" USING GIN (to_tsvector('english', "name" || ' ' || COALESCE("companyName", '')));
CREATE INDEX IF NOT EXISTS "idx_material_search" ON "Material" USING GIN (to_tsvector('english', "name" || ' ' || COALESCE("description", '')));
CREATE INDEX IF NOT EXISTS "idx_quote_search" ON "Quote" USING GIN (to_tsvector('english', "number" || ' ' || COALESCE("notes", '')));
```

## Index Purpose

### Foreign Key Indexes
- All foreign key columns have indexes to improve JOIN performance
- Composite indexes for common query patterns

### Query Optimization
- Status fields indexed for filtering
- Date fields indexed for sorting and range queries
- Tenant ID indexed on all tables for multi-tenant isolation

### Text Search
- GIN indexes for full-text search on customer names, material descriptions, and quote numbers

## Applying Indexes

1. **During Development:**
   ```bash
   # Start your PostgreSQL database
   docker-compose up -d postgres
   
   # Run the migration
   npm run db:migrate
   ```

2. **Manual Application:**
   ```bash
   # Connect to your database
   psql -U postgres -d madfam_quoting
   
   # Run the SQL commands above
   ```

3. **In Production:**
   - Apply indexes during low-traffic periods
   - Monitor index creation progress
   - Some indexes may take time on large tables

## Monitoring Index Usage

Check index usage with:
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## Notes

- Indexes are created with `IF NOT EXISTS` to be idempotent
- Text search indexes require PostgreSQL
- Monitor database performance after applying indexes
- Consider partitioning for very large tables