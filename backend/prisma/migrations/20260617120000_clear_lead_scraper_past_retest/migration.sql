-- Retest cleanup: wipe unimported scraper past results and search cache again.
-- Pipeline leads (Lead.googlePlaceId) and their LeadScraperPlace rows are preserved.

DELETE FROM "LeadScraperPlaceView"
WHERE "placeId" NOT IN (
  SELECT "googlePlaceId" FROM "Lead" WHERE "googlePlaceId" IS NOT NULL
);

DELETE FROM "LeadScraperSearchCache";

DELETE FROM "LeadScraperPlace"
WHERE "placeId" NOT IN (
  SELECT "googlePlaceId" FROM "Lead" WHERE "googlePlaceId" IS NOT NULL
);
