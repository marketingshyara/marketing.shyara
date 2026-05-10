-- AlterEnum
ALTER TYPE "ActivityAction" ADD VALUE 'SETTINGS_UPDATE';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "assignedToUserId" TEXT;

-- CreateTable
CREATE TABLE "PortalSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "values" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "PortalSettings" ("id", "values", "updatedAt")
VALUES ('default', '{}', CURRENT_TIMESTAMP);

-- Backfill: assign creator as assignee when creator is a sales rep
UPDATE "Lead" AS l
SET "assignedToUserId" = l."createdByUserId"
FROM "User" AS u
WHERE l."createdByUserId" = u."id" AND u."role" = 'SALES_REP';

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Lead_assignedToUserId_idx" ON "Lead"("assignedToUserId");
