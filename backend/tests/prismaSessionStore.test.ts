import { describe, expect, it, vi } from "vitest";
import { PrismaSessionStore } from "../src/lib/prismaSessionStore.js";

function makeStore() {
  const rows = new Map<string, { sid: string; data: object; expiresAt: Date }>();
  const prisma = {
    portalSession: {
      findUnique: vi.fn(async ({ where }: { where: { sid: string } }) => {
        const row = rows.get(where.sid);
        return row ?? null;
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
    }
  };
  return { store: new PrismaSessionStore(prisma as never), rows };
}

function promisifyGet(store: PrismaSessionStore, sid: string) {
  return new Promise<unknown>((resolve, reject) => {
    store.get(sid, (err, session) => {
      if (err) reject(err);
      else resolve(session);
    });
  });
}

function promisifySet(store: PrismaSessionStore, sid: string, session: object) {
  return new Promise<void>((resolve, reject) => {
    store.set(sid, session as never, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

describe("PrismaSessionStore", () => {
  it("round-trips session data", async () => {
    const { store } = makeStore();
    const sid = "sess-1";
    const payload = {
      userId: "u1",
      cookie: { maxAge: 3600_000, originalMaxAge: 3600_000 }
    };
    await promisifySet(store, sid, payload);
    const loaded = await promisifyGet(store, sid);
    expect(loaded).toMatchObject({ userId: "u1" });
  });

  it("returns null for expired sessions", async () => {
    const { store, rows } = makeStore();
    const sid = "sess-expired";
    rows.set(sid, {
      sid,
      data: { userId: "u1" },
      expiresAt: new Date(Date.now() - 1000)
    });
    const loaded = await promisifyGet(store, sid);
    expect(loaded).toBeNull();
  });
});
