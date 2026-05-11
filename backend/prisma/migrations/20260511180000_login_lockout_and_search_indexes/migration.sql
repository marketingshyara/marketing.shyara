-- Login lockout columns on User + functional case-insensitive search indexes on Lead.
-- Defensive: idempotent for environments where partial state may exist.

-- === User.failedLoginAttempts + User.lockedUntil ============================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'failedLoginAttempts'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'lockedUntil'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "lockedUntil" TIMESTAMP(3);
  END IF;
END$$;

-- Index on lockedUntil so we can cheaply purge expired locks if needed.
CREATE INDEX IF NOT EXISTS "User_lockedUntil_idx" ON "User" ("lockedUntil");

-- === Functional indexes for case-insensitive lead search ====================
-- Prisma can't model functional indexes; created here so `contains, insensitive`
-- can use index-supported plans when planner chooses ILIKE on lower(col).
CREATE INDEX IF NOT EXISTS "Lead_clientName_lower_idx"
  ON "Lead" (lower("clientName"));
CREATE INDEX IF NOT EXISTS "Lead_clientEmail_lower_idx"
  ON "Lead" (lower("clientEmail"));

-- Enforce a single pending payment per lead/kind at the database layer to close race windows.
WITH ranked_pending AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY "leadId", "kind" ORDER BY "markedAt" DESC, id DESC) AS rn
  FROM "LeadPayment"
  WHERE "verificationStatus" = 'PENDING'
)
DELETE FROM "LeadPayment" lp
USING ranked_pending rp
WHERE lp.id = rp.id
  AND rp.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "LeadPayment_pending_unique_idx"
  ON "LeadPayment" ("leadId", "kind")
  WHERE "verificationStatus" = 'PENDING';
