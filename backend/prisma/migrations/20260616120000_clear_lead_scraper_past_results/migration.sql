-- One-time cleanup: remove lead-scraper past results and search cache.
-- Preserves Lead rows and LeadScraperPlace rows for places already imported to pipeline.

DELETE FROM "LeadScraperPlaceView"
WHERE "placeId" NOT IN (
  SELECT "googlePlaceId" FROM "Lead" WHERE "googlePlaceId" IS NOT NULL
);

DELETE FROM "LeadScraperSearchCache";

DELETE FROM "LeadScraperPlace"
WHERE "placeId" NOT IN (
  SELECT "googlePlaceId" FROM "Lead" WHERE "googlePlaceId" IS NOT NULL
);
