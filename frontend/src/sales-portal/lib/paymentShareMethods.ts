import { z } from "zod";

/** Display order: reverse of business list (UPI first, Razorpay pages last). */
export const PAYMENT_SHARE_METHOD_KEYS = [
  "upi_id",
  "razorpay_qr",
  "sbi_qr",
  "razorpay_payment_link",
  "razorpay_payment_page"
] as const;

export type PaymentShareMethodKey = (typeof PAYMENT_SHARE_METHOD_KEYS)[number];

export const paymentShareMethodKeySchema = z.enum(PAYMENT_SHARE_METHOD_KEYS);

export const PAYMENT_SHARE_METHOD_LABELS: Record<PaymentShareMethodKey, string> = {
  upi_id: "UPI ID",
  razorpay_qr: "Razorpay QR Code",
  sbi_qr: "SBI QR Code",
  razorpay_payment_link: "Razorpay Payment Link",
  razorpay_payment_page: "Razorpay Payment pages"
};

export const paymentShareMethodConfigSchema = z.object({
  key: paymentShareMethodKeySchema,
  shareValue: z.string().max(2000),
  qrImageUrl: z.union([z.string().url().max(2000), z.literal(""), z.null()]).optional().nullable(),
  instructions: z.string().max(500).optional().nullable()
});

export type PaymentShareMethodConfig = z.infer<typeof paymentShareMethodConfigSchema>;

export function defaultPaymentShareMethods(): PaymentShareMethodConfig[] {
  return PAYMENT_SHARE_METHOD_KEYS.map((key) => ({
    key,
    shareValue: "",
    qrImageUrl: null,
    instructions: null
  }));
}

export function mergePaymentShareMethods(
  stored: PaymentShareMethodConfig[] | undefined
): PaymentShareMethodConfig[] {
  const defaults = defaultPaymentShareMethods();
  if (!stored?.length) return defaults;
  const byKey = new Map(stored.map((m) => [m.key, m]));
  return PAYMENT_SHARE_METHOD_KEYS.map((key) => {
    const existing = byKey.get(key);
    if (!existing) return defaults.find((d) => d.key === key)!;
    return {
      key,
      shareValue: existing.shareValue ?? "",
      qrImageUrl: existing.qrImageUrl ?? null,
      instructions: existing.instructions ?? null
    };
  });
}

export function paymentShareMethodLabel(key: string): string {
  if (paymentShareMethodKeySchema.safeParse(key).success) {
    return PAYMENT_SHARE_METHOD_LABELS[key as PaymentShareMethodKey];
  }
  return key;
}

export function isPaymentShareMethodKey(value: string): value is PaymentShareMethodKey {
  return paymentShareMethodKeySchema.safeParse(value).success;
}

export type PaymentShareMethodKind = "upi" | "url" | "qr";

export function paymentShareMethodKind(key: PaymentShareMethodKey): PaymentShareMethodKind {
  if (key === "upi_id") return "upi";
  if (key === "razorpay_qr" || key === "sbi_qr") return "qr";
  return "url";
}

/** O(1) lookup for share panels; input should already be merge-normalized. */
export function paymentShareMethodsByKey(
  methods: PaymentShareMethodConfig[]
): Map<PaymentShareMethodKey, PaymentShareMethodConfig> {
  return new Map(methods.map((m) => [m.key, m]));
}

export function resolvePaymentShareConfig(
  methods: PaymentShareMethodConfig[],
  key: PaymentShareMethodKey
): PaymentShareMethodConfig {
  const found = methods.find((m) => m.key === key);
  if (found) return found;
  return { key, shareValue: "", qrImageUrl: null, instructions: null };
}

export function isPaymentMethodConfigured(config: PaymentShareMethodConfig): boolean {
  const shareValue = config.shareValue.trim();
  const qrUrl = config.qrImageUrl?.trim() || "";
  return shareValue.length > 0 || qrUrl.length > 0;
}
