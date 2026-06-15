-- Lead scraper integration: quota, cache, places, pipeline link

ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "googlePlaceId" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "scraperImportedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "Lead_googlePlaceId_key" ON "Lead"("googlePlaceId");

CREATE TABLE IF NOT EXISTS "LeadScraperUserQuota" (
    "userId" TEXT NOT NULL,
    "monthlyQuota" INTEGER NOT NULL DEFAULT 40,
    "searchesUsed" INTEGER NOT NULL DEFAULT 0,
    "quotaResetMonth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadScraperUserQuota_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE IF NOT EXISTS "LeadScraperGlobalUsage" (
    "yearMonth" TEXT NOT NULL,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadScraperGlobalUsage_pkey" PRIMARY KEY ("yearMonth")
);

CREATE TABLE IF NOT EXISTS "LeadScraperSearchCache" (
    "id" TEXT NOT NULL,
    "locationKey" TEXT NOT NULL,
    "keyword" TEXT NOT NULL DEFAULT 'business',
    "resultsJson" JSONB NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "noWebsiteCount" INTEGER NOT NULL DEFAULT 0,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "searchedByUserId" TEXT,
    "searchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadScraperSearchCache_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeadScraperPlace" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "category" TEXT,
    "hasWebsite" BOOLEAN NOT NULL DEFAULT false,
    "websiteUrl" TEXT,
    "mapsUrl" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "sourceSearchCacheId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadScraperPlace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeadScraperPlaceView" (
    "userId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadScraperPlaceView_pkey" PRIMARY KEY ("userId","placeId")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LeadScraperSearchCache_locationKey_keyword_key" ON "LeadScraperSearchCache"("locationKey", "keyword");
CREATE INDEX IF NOT EXISTS "LeadScraperSearchCache_locationKey_keyword_idx" ON "LeadScraperSearchCache"("locationKey", "keyword");
CREATE UNIQUE INDEX IF NOT EXISTS "LeadScraperPlace_placeId_key" ON "LeadScraperPlace"("placeId");
CREATE INDEX IF NOT EXISTS "LeadScraperPlace_hasWebsite_idx" ON "LeadScraperPlace"("hasWebsite");
CREATE INDEX IF NOT EXISTS "LeadScraperPlaceView_userId_viewedAt_idx" ON "LeadScraperPlaceView"("userId", "viewedAt");

ALTER TABLE "LeadScraperUserQuota" DROP CONSTRAINT IF EXISTS "LeadScraperUserQuota_userId_fkey";
ALTER TABLE "LeadScraperUserQuota" ADD CONSTRAINT "LeadScraperUserQuota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeadScraperSearchCache" DROP CONSTRAINT IF EXISTS "LeadScraperSearchCache_searchedByUserId_fkey";
ALTER TABLE "LeadScraperSearchCache" ADD CONSTRAINT "LeadScraperSearchCache_searchedByUserId_fkey" FOREIGN KEY ("searchedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LeadScraperPlaceView" DROP CONSTRAINT IF EXISTS "LeadScraperPlaceView_userId_fkey";
ALTER TABLE "LeadScraperPlaceView" ADD CONSTRAINT "LeadScraperPlaceView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeadScraperPlaceView" DROP CONSTRAINT IF EXISTS "LeadScraperPlaceView_placeId_fkey";
ALTER TABLE "LeadScraperPlaceView" ADD CONSTRAINT "LeadScraperPlaceView_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "LeadScraperPlace"("placeId") ON DELETE CASCADE ON UPDATE CASCADE;
