-- AlterTable
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "notInterestedAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "notInterestedNote" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "notInterestedByUserId" TEXT;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Lead_notInterestedByUserId_fkey'
  ) THEN
    ALTER TABLE "Lead"
      ADD CONSTRAINT "Lead_notInterestedByUserId_fkey"
      FOREIGN KEY ("notInterestedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lead_notInterestedAt_idx" ON "Lead"("notInterestedAt");
CREATE INDEX IF NOT EXISTS "Lead_assignedToUserId_createdAt_idx" ON "Lead"("assignedToUserId", "createdAt");
