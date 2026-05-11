-- Drift fix: some databases were marked migrated without this column (e.g. early db push / manual schema).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "displayName" TEXT;
