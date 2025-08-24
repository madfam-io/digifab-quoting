-- CreateTable for guest sessions
CREATE TABLE "GuestSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "quoteCount" INTEGER NOT NULL DEFAULT 0,
    "convertedAt" TIMESTAMP(3),
    "convertedUserId" TEXT,

    CONSTRAINT "GuestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable for guest quotes (stored in Redis, but tracking in DB)
CREATE TABLE "GuestQuote" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "quoteData" JSONB NOT NULL,
    "fileKeys" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "GuestQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable for quote conversions
CREATE TABLE "QuoteConversion" (
    "id" TEXT NOT NULL,
    "guestQuoteId" TEXT NOT NULL,
    "convertedQuoteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "conversionType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteConversion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestSession_sessionToken_key" ON "GuestSession"("sessionToken");
CREATE INDEX "GuestSession_expiresAt_idx" ON "GuestSession"("expiresAt");
CREATE INDEX "GuestSession_convertedUserId_idx" ON "GuestSession"("convertedUserId");

-- CreateIndex
CREATE INDEX "GuestQuote_sessionId_idx" ON "GuestQuote"("sessionId");
CREATE INDEX "GuestQuote_createdAt_idx" ON "GuestQuote"("createdAt");
CREATE INDEX "GuestQuote_status_idx" ON "GuestQuote"("status");

-- CreateIndex
CREATE INDEX "QuoteConversion_userId_idx" ON "QuoteConversion"("userId");
CREATE INDEX "QuoteConversion_sessionId_idx" ON "QuoteConversion"("sessionId");
CREATE INDEX "QuoteConversion_guestQuoteId_idx" ON "QuoteConversion"("guestQuoteId");
CREATE INDEX "QuoteConversion_convertedQuoteId_idx" ON "QuoteConversion"("convertedQuoteId");

-- AddForeignKey
ALTER TABLE "GuestSession" ADD CONSTRAINT "GuestSession_convertedUserId_fkey" FOREIGN KEY ("convertedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestQuote" ADD CONSTRAINT "GuestQuote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteConversion" ADD CONSTRAINT "QuoteConversion_guestQuoteId_fkey" FOREIGN KEY ("guestQuoteId") REFERENCES "GuestQuote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteConversion" ADD CONSTRAINT "QuoteConversion_convertedQuoteId_fkey" FOREIGN KEY ("convertedQuoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteConversion" ADD CONSTRAINT "QuoteConversion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteConversion" ADD CONSTRAINT "QuoteConversion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GuestSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update Quote table to track origin
ALTER TABLE "Quote" ADD COLUMN "origin" TEXT DEFAULT 'authenticated';
ALTER TABLE "Quote" ADD COLUMN "guestSessionId" TEXT;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_guestSessionId_fkey" FOREIGN KEY ("guestSessionId") REFERENCES "GuestSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;