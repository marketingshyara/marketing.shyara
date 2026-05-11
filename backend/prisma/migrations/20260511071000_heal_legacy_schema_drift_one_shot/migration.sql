-- One-shot drift healing for production databases that were baselined from older schemas.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'UserRole' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SALES_REP');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'LeadStatus' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'ADVANCE_PAID', 'BUILDING', 'PREVIEW_SENT', 'FINAL_PAID', 'DEPLOYED', 'COMMISSION_PAID');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'PaymentKind' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "PaymentKind" AS ENUM ('ADVANCE', 'FINAL');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'PaymentVerificationStatus' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "PaymentVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'ActivityAction' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "ActivityAction" AS ENUM (
      'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE',
      'PAYMENT_MARKED', 'PAYMENT_VERIFIED', 'COMMISSION_PAID', 'PASSWORD_CHANGED',
      'EXPORT', 'SETTINGS_UPDATE'
    );
  END IF;
END
$$;

ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'SETTINGS_UPDATE';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "displayName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'ADMIN';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;

UPDATE "User"
SET "name" = COALESCE("name", "displayName", split_part("email", '@', 1), 'Admin')
WHERE "name" IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
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
            ELSE upper("role"::text)
          END
        )::"UserRole";
    EXCEPTION WHEN others THEN
      NULL;
    END;

    UPDATE "User" SET "role" = 'ADMIN'::"UserRole" WHERE "role" IS NULL;
    ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMIN'::"UserRole";
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

DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND is_nullable = 'NO'
      AND column_name NOT IN (
        'id', 'email', 'passwordHash', 'displayName', 'role',
        'isActive', 'mustChangePassword', 'createdAt', 'updatedAt'
      )
  LOOP
    EXECUTE format('ALTER TABLE "User" ALTER COLUMN %I DROP NOT NULL', c.column_name);
  END LOOP;
END
$$;
