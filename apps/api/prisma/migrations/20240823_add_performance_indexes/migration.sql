-- Add indexes for Quote table
CREATE INDEX idx_quote_tenant_status ON "Quote"("tenantId", "status");
CREATE INDEX idx_quote_tenant_customer ON "Quote"("tenantId", "customerId");
CREATE INDEX idx_quote_tenant_created ON "Quote"("tenantId", "createdAt" DESC);
CREATE INDEX idx_quote_tenant_validity ON "Quote"("tenantId", "validityUntil");
CREATE INDEX idx_quote_reference ON "Quote"("reference");

-- Add indexes for QuoteItem table
CREATE INDEX idx_quoteitem_quote ON "QuoteItem"("quoteId");
CREATE INDEX idx_quoteitem_status ON "QuoteItem"("status");
CREATE INDEX idx_quoteitem_process ON "QuoteItem"("process");

-- Add indexes for File table
CREATE INDEX idx_file_tenant ON "File"("tenantId");
CREATE INDEX idx_file_quoteitem ON "File"("quoteItemId");
CREATE INDEX idx_file_tenant_hash ON "File"("tenantId", "hash");
CREATE INDEX idx_file_analyzed ON "File"("analyzedAt");

-- Add indexes for Material table
CREATE INDEX idx_material_tenant_process ON "Material"("tenantId", "process");
CREATE INDEX idx_material_tenant_code ON "Material"("tenantId", "code");
CREATE INDEX idx_material_active ON "Material"("active");

-- Add indexes for Machine table
CREATE INDEX idx_machine_tenant_process ON "Machine"("tenantId", "process");
CREATE INDEX idx_machine_active ON "Machine"("active");

-- Add indexes for Customer table
CREATE INDEX idx_customer_tenant_email ON "Customer"("tenantId", "email");
CREATE INDEX idx_customer_tenant_created ON "Customer"("tenantId", "createdAt" DESC);

-- Add indexes for Order table
CREATE INDEX idx_order_tenant_status ON "Order"("tenantId", "status");
CREATE INDEX idx_order_tenant_customer ON "Order"("tenantId", "customerId");
CREATE INDEX idx_order_quote ON "Order"("quoteId");

-- Add indexes for Payment table
CREATE INDEX idx_payment_tenant_order ON "Payment"("tenantId", "orderId");
CREATE INDEX idx_payment_tenant_status ON "Payment"("tenantId", "status");
CREATE INDEX idx_payment_stripe ON "Payment"("stripePaymentIntentId");

-- Add indexes for Tenant table
CREATE INDEX idx_tenant_subdomain ON "Tenant"("subdomain");
CREATE INDEX idx_tenant_active ON "Tenant"("active");

-- Add indexes for User table
CREATE INDEX idx_user_tenant_email ON "User"("tenantId", "email");
CREATE INDEX idx_user_tenant_role ON "User"("tenantId", "role");
CREATE INDEX idx_user_active ON "User"("active");

-- Add indexes for ApiKey table
CREATE INDEX idx_apikey_tenant ON "ApiKey"("tenantId");
CREATE INDEX idx_apikey_key_hash ON "ApiKey"("keyHash");
CREATE INDEX idx_apikey_active ON "ApiKey"("active");
CREATE INDEX idx_apikey_expires ON "ApiKey"("expiresAt");

-- Add partial indexes for common queries
CREATE INDEX idx_quote_pending_calculation ON "Quote"("tenantId", "id") 
  WHERE "status" IN ('SUBMITTED', 'CALCULATING');

CREATE INDEX idx_quote_ready_for_payment ON "Quote"("tenantId", "id", "customerId") 
  WHERE "status" IN ('QUOTED', 'AUTO_QUOTED');

CREATE INDEX idx_file_pending_analysis ON "File"("tenantId", "id") 
  WHERE "analyzedAt" IS NULL;

-- Add composite indexes for join operations
CREATE INDEX idx_quoteitem_composite ON "QuoteItem"("quoteId", "status", "process");