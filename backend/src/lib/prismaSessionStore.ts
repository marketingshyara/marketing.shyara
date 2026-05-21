import type { SessionStore } from "@fastify/session";
import type { PrismaClient } from "@prisma/client";
import type { FastifySessionObject } from "@fastify/session";

type Callback = (err?: Error) => void;
type GetCallback = (err?: Error, session?: FastifySessionObject | null) => void;

function sessionExpiresAt(session: FastifySessionObject): Date {
  const cookie = session.cookie as { maxAge?: number; originalMaxAge?: number } | undefined;
  const maxAgeMs =
    typeof cookie?.maxAge === "number"
      ? cookie.maxAge
      : typeof cookie?.originalMaxAge === "number"
        ? cookie.originalMaxAge
        : 7 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + maxAgeMs);
}

/**
 * Postgres-backed session store so sessions survive deploys and load-balanced instances.
 */
export class PrismaSessionStore implements SessionStore {
  constructor(private readonly prisma: PrismaClient) {}

  get(sessionId: string, callback: GetCallback): void {
    void (async () => {
      const row = await this.prisma.portalSession.findUnique({ where: { sid: sessionId } });
      if (!row) {
        callback(undefined, null);
        return;
      }
      if (row.expiresAt.getTime() <= Date.now()) {
        await this.prisma.portalSession.delete({ where: { sid: sessionId } }).catch(() => {});
        callback(undefined, null);
        return;
      }
      callback(undefined, row.data as unknown as FastifySessionObject);
    })().catch((err: Error) => callback(err));
  }

  set(sessionId: string, session: FastifySessionObject, callback: Callback): void {
    void (async () => {
      const expiresAt = sessionExpiresAt(session);
      await this.prisma.portalSession.upsert({
        where: { sid: sessionId },
        create: {
          sid: sessionId,
          data: session as object,
          expiresAt
        },
        update: {
          data: session as object,
          expiresAt
        }
      });
      await this.prisma.portalSession
        .deleteMany({ where: { expiresAt: { lt: new Date() } } })
        .catch(() => {});
      callback();
    })().catch((err: Error) => callback(err));
  }

  destroy(sessionId: string, callback: Callback): void {
    void this.prisma.portalSession
      .delete({ where: { sid: sessionId } })
      .then(() => callback())
      .catch((err: Error) => callback(err));
  }
}
