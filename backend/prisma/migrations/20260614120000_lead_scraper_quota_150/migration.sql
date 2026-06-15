-- Raise per-rep default quota from 40 to 150 for existing rows still on the old default.
UPDATE "LeadScraperUserQuota"
SET "monthlyQuota" = 150
WHERE "monthlyQuota" = 40;

-- Align column default for new rows (idempotent if already 150).
ALTER TABLE "LeadScraperUserQuota" ALTER COLUMN "monthlyQuota" SET DEFAULT 150;
