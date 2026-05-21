-- CreateTable
CREATE TABLE "portal_sessions" (
    "sid" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_sessions_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex
CREATE INDEX "portal_sessions_expiresAt_idx" ON "portal_sessions"("expiresAt");
