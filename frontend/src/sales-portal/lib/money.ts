const DEFAULT_LOCALE = "en-IN";
const DEFAULT_CURRENCY = "INR";

export function formatMinorUnits(
  amountCents: number | null | undefined,
  options?: { locale?: string; currency?: string }
): string {
  if (amountCents == null) return "—";
  const locale = options?.locale ?? DEFAULT_LOCALE;
  const currency = options?.currency ?? DEFAULT_CURRENCY;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amountCents / 100);
}

export function bpsToPercentLabel(bps: number): string {
  return `${(bps / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}

export function parseRupeeInputToCents(value: string): number | null {
  const normalized = value.replace(/,/g, "").trim();
  if (normalized === "") return null;
  const n = Number.parseFloat(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

/** Mirror backend splitAgreedTotalCents for live form preview. */
export function splitAgreedTotalCents(
  totalCents: number,
  advanceShareBps: number
): { advanceAmountCents: number; finalQuoteCents: number } {
  const advanceAmountCents = Math.floor((totalCents * advanceShareBps) / 10000);
  return { advanceAmountCents, finalQuoteCents: totalCents - advanceAmountCents };
}

export type DealSplitPreview = {
  advanceAmountCents: number;
  finalQuoteCents: number;
};

export type DealSplitDisplay = {
  advanceCents: number | null;
  dueCents: number | null;
  /** True when amounts come from persisted lead fields (post-convert). */
  fromServer: boolean;
};

/** Server-stored split after convert; otherwise live preview from agreed total input. */
export function resolveDealSplitDisplay(
  lead: {
    convertedAt: string | null;
    advanceAmountCents: number | null;
    finalQuoteCents: number | null;
  },
  preview: DealSplitPreview | null
): DealSplitDisplay {
  if (lead.convertedAt) {
    return {
      advanceCents: lead.advanceAmountCents,
      dueCents: lead.finalQuoteCents,
      fromServer: true
    };
  }
  if (preview) {
    return {
      advanceCents: preview.advanceAmountCents,
      dueCents: preview.finalQuoteCents,
      fromServer: false
    };
  }
  return { advanceCents: null, dueCents: null, fromServer: false };
}

export function centsToRupeeInputString(cents: number): string {
  if (cents <= 0) return "0";
  const rupees = cents / 100;
  return Number.isInteger(rupees) ? String(rupees) : rupees.toFixed(2);
}

export function estimateCommissionCents(
  agreedTotalCents: number,
  commissionRateBps: number,
  rounding: "floor" | "round" | "bankers"
): number {
  const numerator = agreedTotalCents * commissionRateBps;
  const quotient = Math.floor(numerator / 10000);
  const remainder = numerator - quotient * 10000;
  if (remainder === 0) return quotient;
  if (rounding === "floor") return quotient;
  if (rounding === "round") return remainder * 2 >= 10000 ? quotient + 1 : quotient;
  const twice = remainder * 2;
  if (twice < 10000) return quotient;
  if (twice > 10000) return quotient + 1;
  return quotient % 2 === 0 ? quotient : quotient + 1;
}
