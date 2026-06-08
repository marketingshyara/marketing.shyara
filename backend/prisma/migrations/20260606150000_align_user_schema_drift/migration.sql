-- Align User table with schema.prisma after legacy drift-heal migrations.
ALTER TABLE "User" DROP COLUMN IF EXISTS "name";
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
CREATE INDEX IF NOT EXISTS "User_role_isActive_idx" ON "User"("role", "isActive");
