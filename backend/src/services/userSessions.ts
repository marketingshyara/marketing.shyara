import type { PrismaClient } from "@prisma/client";

/** Best-effort: destroy portal sessions for a user so open tabs log out immediately. */
export async function destroyPortalSessionsForUser(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM portal_sessions
    WHERE data->>'userId' = ${userId}
  `.catch(() => {});
}
