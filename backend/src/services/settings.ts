import type { LeadStatus, PrismaClient } from "@prisma/client";
import { HttpError } from "../errors/httpError.js";
import {
  parsePortalSettings,
  patchPortalSettingsSchema,
  pickPortalSettingsPatchInput,
  portalSettingsSchema,
  type PortalSettingsValues
} from "../validators/schemas.js";

const CACHE_TTL_MS = 45_000;
let cache: { expiresAt: number; value: PortalSettingsValues } | null = null;

export function invalidatePortalSettingsCache(): void {
  cache = null;
}

export async function getPortalSettings(prisma: PrismaClient): Promise<PortalSettingsValues> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.value;
  }

  const row = await prisma.portalSettings.findUnique({ where: { id: "default" } });
  const value = parsePortalSettings(row?.values);
  cache = { expiresAt: now + CACHE_TTL_MS, value };
  return value;
}

export async function updatePortalSettingsValues(
  prisma: PrismaClient,
  patch: unknown
): Promise<PortalSettingsValues> {
  const parsedPatch = patchPortalSettingsSchema.parse(pickPortalSettingsPatchInput(patch));
  const row = await prisma.portalSettings.findUnique({ where: { id: "default" } });
  const current = parsePortalSettings(row?.values);
  const merged = portalSettingsSchema.parse({
    ...current,
    ...parsedPatch
  });

  await prisma.portalSettings.upsert({
    where: { id: "default" },
    create: { id: "default", values: merged as object },
    update: { values: merged as object }
  });

  invalidatePortalSettingsCache();
  return merged;
}

export function toPublicSettings(values: PortalSettingsValues): PortalSettingsValues {
  return values;
}

export function getRequiredLeadStatusForPaymentKind(
  settings: PortalSettingsValues,
  kind: "ADVANCE" | "FINAL"
): LeadStatus {
  return kind === "ADVANCE"
    ? settings.advancePaymentRequiredLeadStatus
    : settings.finalPaymentRequiredLeadStatus;
}

export function getRequiredLeadStatusForVerify(
  settings: PortalSettingsValues,
  kind: "ADVANCE" | "FINAL"
): LeadStatus {
  return kind === "ADVANCE"
    ? settings.advanceVerifyRequiredLeadStatus
    : settings.finalVerifyRequiredLeadStatus;
}

/**
 * When `quoteCents` is null or not positive, enforcement is skipped so verified payments
 * can still be processed before a quote is recorded; tolerance only applies once a quote exists.
 */
export function assertPaymentMatchesQuoteTolerance(
  paymentCents: number,
  quoteCents: number | null,
  toleranceBps: number | null,
  label: string
): void {
  if (toleranceBps === null || quoteCents === null || quoteCents <= 0) {
    return;
  }
  const diff = Math.abs(paymentCents - quoteCents);
  const maxDiff = Math.ceil((quoteCents * toleranceBps) / 10000);
  if (diff > maxDiff) {
    throw new HttpError(
      400,
      "PAYMENT_QUOTE_MISMATCH",
      `${label} amount does not match quoted amount within configured tolerance.`
    );
  }
}
