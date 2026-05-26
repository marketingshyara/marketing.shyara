import type { LeadStatus, Prisma, PrismaClient } from "@prisma/client";
import { HttpError } from "../errors/httpError.js";
import {
  parsePortalSettings,
  patchPortalSettingsSchema,
  pickPortalSettingsPatchInput,
  portalSettingsSchema,
  type PortalSettingsValues
} from "../validators/schemas.js";

/**
 * Cache keyed by the row's `updatedAt`. Every read still does a single PK lookup so that other
 * instances/processes never serve a stale settings value after an admin PATCH — the previous
 * 45s TTL allowed multi-instance drift which is unacceptable for money-affecting settings.
 * The lookup selects only `updatedAt` + `values` to keep it cheap.
 */
let cache: { updatedAt: number; value: PortalSettingsValues } | null = null;

export function invalidatePortalSettingsCache(): void {
  cache = null;
}

export async function getPortalSettings(prisma: PrismaClient): Promise<PortalSettingsValues>;
export async function getPortalSettings(
  prisma: Prisma.TransactionClient
): Promise<PortalSettingsValues>;

export async function getPortalSettings(
  prisma: PrismaClient | Prisma.TransactionClient
): Promise<PortalSettingsValues> {
  const row = await prisma.portalSettings.findUnique({
    where: { id: "default" },
    select: { values: true, updatedAt: true }
  });
  const ts = row?.updatedAt.getTime() ?? 0;
  if (cache && cache.updatedAt === ts) {
    return cache.value;
  }
  const value = parsePortalSettings(row?.values);
  cache = { updatedAt: ts, value };
  return value;
}

export type UpdatePortalSettingsResult = {
  settings: PortalSettingsValues;
  /** Parsed values row before this patch (same tx read for audit consistency). */
  before: PortalSettingsValues;
};

export async function updatePortalSettingsValues(
  prisma: PrismaClient,
  patch: unknown
): Promise<UpdatePortalSettingsResult> {
  const parsedPatch = patchPortalSettingsSchema.parse(pickPortalSettingsPatchInput(patch));

  return prisma.$transaction(async (tx) => {
    const row = await tx.portalSettings.findUnique({
      where: { id: "default" },
      select: { values: true, updatedAt: true }
    });

    if (!row) {
      const before = parsePortalSettings(undefined);
      const merged = portalSettingsSchema.parse({
        ...before,
        ...parsedPatch
      });
      await tx.portalSettings.create({
        data: { id: "default", values: merged as object }
      });
      invalidatePortalSettingsCache();
      return { settings: merged, before };
    }

    const before = parsePortalSettings(row.values);
    const merged = portalSettingsSchema.parse({
      ...before,
      ...parsedPatch
    });

    const claim = await tx.portalSettings.updateMany({
      where: { id: "default", updatedAt: row.updatedAt },
      data: { values: merged as object }
    });
    if (claim.count === 0) {
      throw new HttpError(
        409,
        "CONCURRENT_MODIFICATION",
        "Settings were modified concurrently; refresh and retry."
      );
    }

    invalidatePortalSettingsCache();
    return { settings: merged, before };
  });
}

/** Full settings for admins. */
export function toPublicSettings(values: PortalSettingsValues): PortalSettingsValues {
  return values;
}

/** Rep-facing subset (no commission tuning or manual transitions). */
export function toRepPortalSettings(values: PortalSettingsValues) {
  return {
    minAgreedTotalCents: values.minAgreedTotalCents,
    advancePaymentShareBps: values.advancePaymentShareBps,
    commissionRateBps: values.commissionRateBps,
    commissionRounding: values.commissionRounding,
    templatesCatalogUrl: values.templatesCatalogUrl,
    tutorialLinks: values.tutorialLinks,
    painPointsByCategory: values.painPointsByCategory,
    paymentShareMethods: values.paymentShareMethods
  };
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
