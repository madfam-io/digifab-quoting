-- Add missing fields to Order model
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "orderNumber" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "tax" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "shipping" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "totalAmount" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "productionStartedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "shippedAt" TIMESTAMP;

-- Update number to orderNumber if needed
UPDATE "Order" SET "orderNumber" = "number" WHERE "orderNumber" IS NULL;
ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL;

-- Add missing fields to PaymentIntent model
ALTER TABLE "PaymentIntent" 
ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "stripeSessionId" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "orderId" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "errorMessage" TEXT;

-- Add missing fields to Quote model
ALTER TABLE "Quote" 
ADD COLUMN IF NOT EXISTS "shipping" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "totalPrice" DECIMAL(10,2);

-- Update totalPrice from total if exists
UPDATE "Quote" SET "totalPrice" = "total" WHERE "totalPrice" IS NULL AND "total" IS NOT NULL;

-- Add missing fields to Invoice model
ALTER TABLE "Invoice" 
ADD COLUMN IF NOT EXISTS "invoiceNumber" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "tax" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "shipping" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "totalAmount" DECIMAL(10,2);

-- Update invoiceNumber from number if needed
UPDATE "Invoice" SET "invoiceNumber" = "number" WHERE "invoiceNumber" IS NULL;
ALTER TABLE "Invoice" ALTER COLUMN "invoiceNumber" SET NOT NULL;

-- Create OrderItem model
CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "partId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "process" TEXT NOT NULL,
  "material" TEXT NOT NULL,
  "finishOptions" JSONB DEFAULT '{}',
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "subtotal" DECIMAL(10,2) NOT NULL,
  "leadTimeDays" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- Create InvoiceLineItem model
CREATE TABLE IF NOT EXISTS "InvoiceLineItem" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  
  CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY ("id")
);

-- Add Customer model if using separate customer table
CREATE TABLE IF NOT EXISTS "Customer" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "company" TEXT,
  "phone" TEXT,
  "address" JSONB DEFAULT '{}',
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX IF NOT EXISTS "PaymentIntent_stripePaymentIntentId_idx" ON "PaymentIntent"("stripePaymentIntentId");
CREATE INDEX IF NOT EXISTS "PaymentIntent_stripeSessionId_idx" ON "PaymentIntent"("stripeSessionId");
CREATE INDEX IF NOT EXISTS "PaymentIntent_orderId_idx" ON "PaymentIntent"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_tenantId_idx" ON "OrderItem"("tenantId");
CREATE INDEX IF NOT EXISTS "InvoiceLineItem_invoiceId_idx" ON "InvoiceLineItem"("invoiceId");
CREATE INDEX IF NOT EXISTS "InvoiceLineItem_tenantId_idx" ON "InvoiceLineItem"("tenantId");
CREATE INDEX IF NOT EXISTS "Customer_tenantId_idx" ON "Customer"("tenantId");
CREATE INDEX IF NOT EXISTS "Customer_email_idx" ON "Customer"("email");

-- Add foreign key constraints
ALTER TABLE "OrderItem" 
ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InvoiceLineItem" 
ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PaymentIntent" 
ADD CONSTRAINT "PaymentIntent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;