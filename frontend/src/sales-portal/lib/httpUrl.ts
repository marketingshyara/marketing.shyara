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

/** Normalize before API mutate; throws if non-empty but invalid. */
export function prepareHttpUrlForMutation(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = tryNormalizeHttpUrl(trimmed);
  if (!normalized) {
    throw new Error("Enter a valid link (e.g. https://example.com or example.com).");
  }
  return normalized;
}

const emptyToNull = (v: unknown) => {
  if (v === undefined) return undefined;
  if (v === "" || v === null) return null;
  return v;
};

export const optionalHttpUrlSchema = z.preprocess(
  emptyToNull,
  z.preprocess((v) => {
    if (v === null) return null;
    if (typeof v !== "string") return v;
    return tryNormalizeHttpUrl(v);
  }, z.union([z.string().url().max(2000), z.null()]).optional())
);

export const requiredHttpUrlSchema = z.preprocess((v) => {
  if (typeof v !== "string") return v;
  return tryNormalizeHttpUrl(v);
}, z.string().url().max(2000));
