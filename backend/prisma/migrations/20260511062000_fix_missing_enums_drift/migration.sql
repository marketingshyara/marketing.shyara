-- Drift fix: production DB may be missing enum types while migrations are marked applied.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'UserRole' AND n.nspname = 'public') THEN
    CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SALES_REP');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'LeadStatus' AND n.nspname = 'public') THEN
    CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'ADVANCE_PAID', 'BUILDING', 'PREVIEW_SENT', 'FINAL_PAID', 'DEPLOYED', 'COMMISSION_PAID');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'PaymentKind' AND n.nspname = 'public') THEN
    CREATE TYPE "PaymentKind" AS ENUM ('ADVANCE', 'FINAL');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'PaymentVerificationStatus' AND n.nspname = 'public') THEN
    CREATE TYPE "PaymentVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'ActivityAction' AND n.nspname = 'public') THEN
    CREATE TYPE "ActivityAction" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'PAYMENT_MARKED', 'PAYMENT_VERIFIED', 'COMMISSION_PAID', 'PASSWORD_CHANGED', 'EXPORT', 'SETTINGS_UPDATE');
  END IF;
END
$$;

ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'SETTINGS_UPDATE';
