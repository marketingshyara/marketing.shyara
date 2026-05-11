-- Drift fix: some production schemas have User.role bound to old enum "Role" or lowercase enum values.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'UserRole' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SALES_REP');
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'role'
  ) THEN
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
    ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMIN'::"UserRole";
  END IF;
END
$$;
