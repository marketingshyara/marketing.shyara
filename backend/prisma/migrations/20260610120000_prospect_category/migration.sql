-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProspectCategory') THEN
    CREATE TYPE "ProspectCategory" AS ENUM (
      'NEW_LEAD',
      'CALLBACK_REQUESTED',
      'NO_ANSWER',
      'INTERESTED',
      'FOLLOW_UP',
      'NOT_INTERESTED'
    );
  END IF;
END $$;

-- AlterTable: add new columns
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "prospectCategory" "ProspectCategory" NOT NULL DEFAULT 'NEW_LEAD';
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "callbackScheduledAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "interestedSampleShared" BOOLEAN;

-- Backfill prospectCategory from legacy not-interested fields
UPDATE "Lead"
SET "prospectCategory" = 'NOT_INTERESTED'
WHERE "notInterestedAt" IS NOT NULL AND "convertedAt" IS NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "LeadProspectCategoryEvent" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "category" "ProspectCategory" NOT NULL,
  "note" TEXT,
  "callbackAt" TIMESTAMP(3),
  "sampleShared" BOOLEAN,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdByUserId" TEXT NOT NULL,
  CONSTRAINT "LeadProspectCategoryEvent_pkey" PRIMARY KEY ("id")
);

-- Migrate not-interested history
INSERT INTO "LeadProspectCategoryEvent" (
  "id",
  "leadId",
  "category",
  "note",
  "createdAt",
  "createdByUserId"
)
SELECT
  'mig_ni_' || "id",
  "id",
  'NOT_INTERESTED',
  "notInterestedNote",
  COALESCE("notInterestedAt", "updatedAt"),
  COALESCE("notInterestedByUserId", "createdByUserId")
FROM "Lead"
WHERE "notInterestedAt" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "LeadProspectCategoryEvent" e WHERE e."leadId" = "Lead"."id"
  );

-- Seed NEW_LEAD events for unconverted prospects without history
INSERT INTO "LeadProspectCategoryEvent" (
  "id",
  "leadId",
  "category",
  "createdAt",
  "createdByUserId"
)
SELECT
  'mig_nl_' || "id",
  "id",
  'NEW_LEAD',
  "createdAt",
  "createdByUserId"
FROM "Lead"
WHERE "convertedAt" IS NULL
  AND "notInterestedAt" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "LeadProspectCategoryEvent" e WHERE e."leadId" = "Lead"."id"
  );

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LeadProspectCategoryEvent_leadId_fkey'
  ) THEN
    ALTER TABLE "LeadProspectCategoryEvent"
      ADD CONSTRAINT "LeadProspectCategoryEvent_leadId_fkey"
      FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LeadProspectCategoryEvent_createdByUserId_fkey'
  ) THEN
    ALTER TABLE "LeadProspectCategoryEvent"
      ADD CONSTRAINT "LeadProspectCategoryEvent_createdByUserId_fkey"
      FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lead_prospectCategory_idx" ON "Lead"("prospectCategory");
CREATE INDEX IF NOT EXISTS "Lead_assignedToUserId_prospectCategory_idx" ON "Lead"("assignedToUserId", "prospectCategory");
CREATE INDEX IF NOT EXISTS "LeadProspectCategoryEvent_leadId_createdAt_idx" ON "LeadProspectCategoryEvent"("leadId", "createdAt");

-- Drop legacy not-interested columns
ALTER TABLE "Lead" DROP CONSTRAINT IF EXISTS "Lead_notInterestedByUserId_fkey";
DROP INDEX IF EXISTS "Lead_notInterestedAt_idx";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "notInterestedAt";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "notInterestedNote";
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "notInterestedByUserId";
