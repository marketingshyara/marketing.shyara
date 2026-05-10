import { Prisma } from "@prisma/client";
import { HttpError } from "../errors/httpError.js";

function isEmailUniqueTarget(meta: unknown): boolean {
  const target = meta && typeof meta === "object" && "target" in meta ? (meta as { target?: unknown }).target : undefined;
  if (!Array.isArray(target)) return false;
  return target.some((f) => String(f).toLowerCase() === "email");
}

/** Map Prisma unique violations on User.email to a client-friendly error; rethrows otherwise. */
export function mapUserCreateError(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002" && isEmailUniqueTarget(err.meta)) {
    throw new HttpError(409, "EMAIL_IN_USE", "An account with this email already exists.");
  }
  throw err;
}
