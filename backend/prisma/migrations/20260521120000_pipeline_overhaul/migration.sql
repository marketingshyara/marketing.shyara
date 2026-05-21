-- Pipeline overhaul: client conversion, WhatsApp, stage checkpoints, commission bonus

ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "convertedAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "whatsappGroupLink" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "whatsappVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "demoFinalizedAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "accountsReadyAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "accountsReadyVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "repoTransferVerifiedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Lead_convertedAt_idx" ON "Lead"("convertedAt");

ALTER TABLE "Commission" ADD COLUMN IF NOT EXISTS "bonusCents" INTEGER NOT NULL DEFAULT 0;

-- Backfill: existing progressed leads count as converted clients
UPDATE "Lead"
SET "convertedAt" = COALESCE("convertedAt", "updatedAt")
WHERE "convertedAt" IS NULL
  AND (
    "status"::text NOT IN ('NEW')
    OR EXISTS (
      SELECT 1 FROM "LeadPayment" p
      WHERE p."leadId" = "Lead"."id"
    )
  );
