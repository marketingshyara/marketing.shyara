import { z } from "zod";

/** Trim; empty → null; prepend https:// when scheme missing; return href or null if invalid. */
export function tryNormalizeHttpUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

/** Empty string clears to null; omit key when field was not sent (undefined). */
const emptyToNull = (v: unknown) => {
  if (v === undefined) return undefined;
  if (v === "" || v === null) return null;
  return v;
};

/** Optional nullable HTTP(S) URL for PATCH bodies (empty string clears). */
export const optionalHttpUrlSchema = z.preprocess(
  emptyToNull,
  z.preprocess((v) => {
    if (v === null) return null;
    if (typeof v !== "string") return v;
    return tryNormalizeHttpUrl(v);
  }, z.union([z.string().url().max(2000), z.null()]).optional())
);

/** Required HTTP(S) URL (e.g. rep deployment submit). */
export const requiredHttpUrlSchema = z.preprocess((v) => {
  if (typeof v !== "string") return v;
  return tryNormalizeHttpUrl(v);
}, z.string().url().max(2000));
