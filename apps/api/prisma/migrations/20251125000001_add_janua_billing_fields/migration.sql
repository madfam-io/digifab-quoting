-- Add Janua multi-provider billing fields to Tenant table
-- Supports Conekta for MX, Polar for international billing

ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "januaCustomerId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "billingProvider" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "countryCode" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "taxId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "email" TEXT;

-- Add unique constraint on januaCustomerId
CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_januaCustomerId_key" ON "Tenant"("januaCustomerId");
