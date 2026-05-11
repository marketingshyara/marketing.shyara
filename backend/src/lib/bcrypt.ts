import bcrypt from "bcryptjs";
import type { FastifyRequest } from "fastify";

/**
 * bcrypt.compare can throw if `stored` is malformed (corrupted hash, empty string, etc.). Treat
 * any throw as a failed compare and log so the login path stays constant-time and never leaks
 * the cause. Returns `false` instead of propagating.
 */
export async function safeBcryptCompare(
  plain: string,
  stored: string,
  request?: FastifyRequest
): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, stored);
  } catch (err) {
    request?.log.error({ err }, "bcrypt.compare failed (invalid stored hash?)");
    return false;
  }
}

/**
 * Static bcrypt hash used to keep failed-lookup branches isobaric with success branches.
 * The hash is a real, valid bcrypt string but will never compare true with any plaintext.
 */
export const DUMMY_BCRYPT_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8.PEihjF.K7ydVDOmM4lzSafIRyf2W";
