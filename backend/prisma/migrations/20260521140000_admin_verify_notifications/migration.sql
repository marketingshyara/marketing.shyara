-- Admin verify parity: demo gate + in-app notifications
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "demoFinalizedVerifiedAt" TIMESTAMP(3);

CREATE TYPE "PortalNotificationKind" AS ENUM ('REP_SUBMITTED', 'ADMIN_VERIFIED', 'ADMIN_DECLINED');

CREATE TABLE IF NOT EXISTS "PortalNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "kind" "PortalNotificationKind" NOT NULL,
    "stageKey" TEXT,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PortalNotification_userId_readAt_idx" ON "PortalNotification"("userId", "readAt");
CREATE INDEX IF NOT EXISTS "PortalNotification_leadId_idx" ON "PortalNotification"("leadId");
CREATE INDEX IF NOT EXISTS "PortalNotification_createdAt_idx" ON "PortalNotification"("createdAt");

DO $$ BEGIN
  ALTER TABLE "PortalNotification" ADD CONSTRAINT "PortalNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PortalNotification" ADD CONSTRAINT "PortalNotification_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
