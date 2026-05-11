-- Drift fix: legacy schemas may still have a required "name" column on User.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;

UPDATE "User"
SET "name" = COALESCE("name", "displayName", split_part("email", '@', 1), 'Admin')
WHERE "name" IS NULL;

ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL;
