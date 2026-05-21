import { vi } from "vitest";

/** In-memory portal_sessions for tests that mock Prisma but use PrismaSessionStore. */
export function createMockPortalSessionModel() {
  const rows = new Map<string, { sid: string; data: object; expiresAt: Date }>();
  return {
    findUnique: vi.fn(async ({ where }: { where: { sid: string } }) => {
      return rows.get(where.sid) ?? null;
    }),
    upsert: vi.fn(
      async ({
        where,
        create,
        update
      }: {
        where: { sid: string };
        create: { sid: string; data: object; expiresAt: Date };
        update: { data: object; expiresAt: Date };
      }) => {
        const existing = rows.get(where.sid);
        if (existing) {
          existing.data = update.data;
          existing.expiresAt = update.expiresAt;
          return existing;
        }
        const row = { sid: create.sid, data: create.data, expiresAt: create.expiresAt };
        rows.set(create.sid, row);
        return row;
      }
    ),
    delete: vi.fn(async ({ where }: { where: { sid: string } }) => {
      rows.delete(where.sid);
    }),
    deleteMany: vi.fn(async () => ({ count: 0 }))
  };
}
