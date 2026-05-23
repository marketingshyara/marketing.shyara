-- Client GitHub account details (rep submits at accounts_ready)
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "clientGithubId" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "clientGithubEmail" TEXT;
