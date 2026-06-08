-- Legacy production drift: User.role may be bound to an old enum. Fresh installs from init already use UserRole.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    JOIN pg_type t ON t.oid = c.udt_name::regtype
    WHERE c.table_schema = 'public'
      AND c.table_name = 'User'
      AND c.column_name = 'role'
      AND t.typname <> 'UserRole'
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
EXCEPTION WHEN others THEN
  NULL;
END $$;
