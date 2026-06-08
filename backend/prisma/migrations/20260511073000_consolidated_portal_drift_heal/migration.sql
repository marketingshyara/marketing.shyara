-- Consolidated in-place drift healing for legacy production schemas.
-- Keeps legacy columns/tables, but guarantees compatibility with current Prisma models.

-- === ENUM ALIGNMENT ==========================================================
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'SETTINGS_UPDATE';

-- === USER TABLE COMPATIBILITY ===============================================
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "displayName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'role'
  ) THEN
    BEGIN
      ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
      ALTER TABLE "User"
        ALTER COLUMN "role" TYPE "UserRole"
        USING (
          CASE
            WHEN "role"::text = 'admin' THEN 'ADMIN'
            WHEN "role"::text = 'sales_rep' THEN 'SALES_REP'
            WHEN "role"::text = 'sales_associate' THEN 'SALES_REP'
            ELSE upper("role"::text)
          END
        )::"UserRole";
    EXCEPTION WHEN others THEN
      NULL;
    END;
    UPDATE "User" SET "role" = 'ADMIN'::"UserRole" WHERE "role" IS NULL;
    ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMIN'::"UserRole";
  ELSE
    ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'ADMIN';
  END IF;
END
$$;

ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "isActive" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "mustChangePassword" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "createdAt" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- === LEAD TABLE COMPATIBILITY ===============================================
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "clientName" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "clientEmail" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "clientPhone" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "assignedToUserId" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "advanceAmountCents" INTEGER;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "finalQuoteCents" INTEGER;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Lead"
SET "clientName" = COALESCE(
  "clientName",
  NULLIF("businessName", ''),
  NULLIF("contactPersonName", ''),
  'Unknown Client'
)
WHERE "clientName" IS NULL;

UPDATE "Lead"
SET "clientEmail" = COALESCE("clientEmail", "email")
WHERE "clientEmail" IS NULL;

UPDATE "Lead"
SET "clientPhone" = COALESCE("clientPhone", "phoneNumber")
WHERE "clientPhone" IS NULL;

UPDATE "Lead"
SET "notes" = COALESCE("notes", "description")
WHERE "notes" IS NULL;

UPDATE "Lead"
SET "assignedToUserId" = COALESCE("assignedToUserId", "assignedSalesPersonId", "createdByUserId")
WHERE "assignedToUserId" IS NULL;

-- Convert legacy lead status values into current enum values.
UPDATE "Lead"
SET "status" = CASE
  WHEN "status"::text IN ('new', 'contacted', 'under_follow_up', 'interested', 'callback_later', 'dormant') THEN 'NEW'::"LeadStatus"
  WHEN "status"::text IN ('payment_pending') THEN 'ADVANCE_PAID'::"LeadStatus"
  WHEN "status"::text IN ('closed_won') THEN 'DEPLOYED'::"LeadStatus"
  WHEN "status"::text IN ('lost', 'not_interested') THEN 'COMMISSION_PAID'::"LeadStatus"
  ELSE "status"
END
WHERE "status"::text IN (
  'new', 'contacted', 'under_follow_up', 'interested', 'callback_later',
  'dormant', 'payment_pending', 'closed_won', 'lost', 'not_interested'
);

ALTER TABLE "Lead" ALTER COLUMN "clientName" SET NOT NULL;
ALTER TABLE "Lead" ALTER COLUMN "createdByUserId" SET NOT NULL;
ALTER TABLE "Lead" ALTER COLUMN "status" SET DEFAULT 'NEW'::"LeadStatus";
ALTER TABLE "Lead" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "Lead" ALTER COLUMN "createdAt" SET NOT NULL;
ALTER TABLE "Lead" ALTER COLUMN "updatedAt" SET NOT NULL;

DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND is_nullable = 'NO'
      AND column_name NOT IN (
        'id', 'createdByUserId', 'clientName', 'status', 'createdAt', 'updatedAt'
      )
  LOOP
    EXECUTE format('ALTER TABLE "Lead" ALTER COLUMN %I DROP NOT NULL', c.column_name);
  END LOOP;
END
$$;

CREATE INDEX IF NOT EXISTS "Lead_status_idx" ON "Lead"("status");
CREATE INDEX IF NOT EXISTS "Lead_createdByUserId_idx" ON "Lead"("createdByUserId");
CREATE INDEX IF NOT EXISTS "Lead_assignedToUserId_idx" ON "Lead"("assignedToUserId");
CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Lead_createdByUserId_fkey') THEN
    ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdByUserId_fkey"
      FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Lead_assignedToUserId_fkey') THEN
    ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToUserId_fkey"
      FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- === PORTAL SETTINGS =========================================================
ALTER TABLE "PortalSettings" ADD COLUMN IF NOT EXISTS "values" JSONB;
ALTER TABLE "PortalSettings" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "PortalSettings" SET "values" = '{}'::jsonb WHERE "values" IS NULL;
ALTER TABLE "PortalSettings" ALTER COLUMN "values" SET NOT NULL;
ALTER TABLE "PortalSettings" ALTER COLUMN "id" SET DEFAULT 'default';
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PortalSettings'
      AND is_nullable = 'NO'
      AND column_name NOT IN ('id', 'values', 'updatedAt')
  LOOP
    EXECUTE format('ALTER TABLE "PortalSettings" ALTER COLUMN %I DROP NOT NULL', c.column_name);
  END LOOP;
END
$$;

-- === LEAD PAYMENT ============================================================
CREATE TABLE IF NOT EXISTS "LeadPayment" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "kind" "PaymentKind" NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "repNote" TEXT,
  "markedByUserId" TEXT NOT NULL,
  "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verificationStatus" "PaymentVerificationStatus" NOT NULL DEFAULT 'PENDING',
  "verifiedByUserId" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "adminNote" TEXT,
  CONSTRAINT "LeadPayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LeadPayment_leadId_idx" ON "LeadPayment"("leadId");
CREATE INDEX IF NOT EXISTS "LeadPayment_verificationStatus_idx" ON "LeadPayment"("verificationStatus");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeadPayment_leadId_fkey') THEN
    ALTER TABLE "LeadPayment" ADD CONSTRAINT "LeadPayment_leadId_fkey"
      FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeadPayment_markedByUserId_fkey') THEN
    ALTER TABLE "LeadPayment" ADD CONSTRAINT "LeadPayment_markedByUserId_fkey"
      FOREIGN KEY ("markedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeadPayment_verifiedByUserId_fkey') THEN
    ALTER TABLE "LeadPayment" ADD CONSTRAINT "LeadPayment_verifiedByUserId_fkey"
      FOREIGN KEY ("verifiedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- === PROJECT =================================================================
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Project"
SET "title" = COALESCE("title", 'Untitled Project')
WHERE "title" IS NULL;

ALTER TABLE "Project" ALTER COLUMN "title" SET NOT NULL;
ALTER TABLE "Project" ALTER COLUMN "leadId" SET NOT NULL;
ALTER TABLE "Project" ALTER COLUMN "createdAt" SET NOT NULL;
ALTER TABLE "Project" ALTER COLUMN "updatedAt" SET NOT NULL;

DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Project'
      AND is_nullable = 'NO'
      AND column_name NOT IN ('id', 'leadId', 'title', 'createdAt', 'updatedAt')
  LOOP
    EXECUTE format('ALTER TABLE "Project" ALTER COLUMN %I DROP NOT NULL', c.column_name);
  END LOOP;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "Project_leadId_key" ON "Project"("leadId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Project_leadId_fkey') THEN
    ALTER TABLE "Project" ADD CONSTRAINT "Project_leadId_fkey"
      FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- === COMMISSION ==============================================================
CREATE TABLE IF NOT EXISTS "Commission" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "repUserId" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "isPaid" BOOLEAN NOT NULL DEFAULT false,
  "paidAt" TIMESTAMP(3),
  "paidByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Commission_leadId_key" ON "Commission"("leadId");
CREATE INDEX IF NOT EXISTS "Commission_repUserId_idx" ON "Commission"("repUserId");
CREATE INDEX IF NOT EXISTS "Commission_isPaid_idx" ON "Commission"("isPaid");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Commission_leadId_fkey') THEN
    ALTER TABLE "Commission" ADD CONSTRAINT "Commission_leadId_fkey"
      FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Commission_repUserId_fkey') THEN
    ALTER TABLE "Commission" ADD CONSTRAINT "Commission_repUserId_fkey"
      FOREIGN KEY ("repUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Commission_paidByAdminId_fkey') THEN
    ALTER TABLE "Commission" ADD CONSTRAINT "Commission_paidByAdminId_fkey"
      FOREIGN KEY ("paidByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- === ACTIVITY LOG ============================================================
CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" "ActivityAction" NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "ip" TEXT,
  "userAgent" TEXT,
  "before" JSONB,
  "after" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "ActivityLog_userId_idx" ON "ActivityLog"("userId");
CREATE INDEX IF NOT EXISTS "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ActivityLog_userId_fkey') THEN
    ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;
