-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "clientDetailsSubmittedAt" TIMESTAMP(3),
ADD COLUMN "clientDetailsVerifiedAt" TIMESTAMP(3);

-- Baseline lock for leads converted before this migration
UPDATE "Lead"
SET "clientDetailsVerifiedAt" = "convertedAt"
WHERE "convertedAt" IS NOT NULL
  AND "clientDetailsVerifiedAt" IS NULL;
