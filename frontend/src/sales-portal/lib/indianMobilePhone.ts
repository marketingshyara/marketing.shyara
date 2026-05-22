import { z } from "zod";

/** Digits only, max 10 — strips +91 / leading 0 when pasted. */
export function normalizeIndianMobileInput(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

/** Valid Indian mobile: 10 digits, first digit 6–9. */
export function isValidIndianMobile(digits: string): boolean {
  return /^[6-9]\d{9}$/.test(digits);
}

export const indianMobilePhoneSchema = z
  .string()
  .min(1, "Mobile number is required.")
  .transform((s) => normalizeIndianMobileInput(s))
  .refine((d) => d.length === 10, "Enter a 10-digit mobile number.")
  .refine(isValidIndianMobile, "Enter a valid Indian mobile number (starts with 6–9).");

export const optionalIndianMobilePhoneSchema = z.preprocess(
  (v) => {
    if (v === undefined) return undefined;
    if (v === "" || v === null) return null;
    return v;
  },
  z.union([indianMobilePhoneSchema, z.null()]).optional()
);
