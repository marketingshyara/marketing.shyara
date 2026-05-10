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
