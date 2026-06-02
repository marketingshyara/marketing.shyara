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

/** Code-owned Razorpay QR asset; update via deploy, not Portal Settings. */
export const RAZORPAY_QR_ASSET_PATH = "/portal-assets/shyara-razorpay-qr.png";

export const RAZORPAY_QR_DEFAULT_INSTRUCTIONS =
  "Scan and pay with any UPI app. Share this QR on WhatsApp with the client.";

const CODE_OWNED_QR_METHOD_KEYS = new Set<PaymentShareMethodKey>(["razorpay_qr", "sbi_qr"]);

export const paymentShareMethodConfigSchema = z.object({
  key: paymentShareMethodKeySchema,
  shareValue: z.string().max(2000).default(""),
  qrImageUrl: z
    .union([
      z.string().url().max(2000),
      z.string().regex(/^\/portal-assets\/.+\.(png|jpg|jpeg|webp|svg)$/i).max(2000),
      z.literal(""),
      z.null()
    ])
    .optional()
    .nullable(),
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

/** QR image URLs are code-owned; never persist admin-supplied values for QR methods. */
export function sanitizePaymentShareMethodForStorage(
  config: PaymentShareMethodConfig
): PaymentShareMethodConfig {
  if (CODE_OWNED_QR_METHOD_KEYS.has(config.key)) {
    return { ...config, qrImageUrl: null };
  }
  return config;
}

function applyCodeOwnedQrConfig(config: PaymentShareMethodConfig): PaymentShareMethodConfig {
  if (config.key === "razorpay_qr") {
    return {
      ...config,
      qrImageUrl: RAZORPAY_QR_ASSET_PATH,
      instructions: config.instructions?.trim() || RAZORPAY_QR_DEFAULT_INSTRUCTIONS
    };
  }
  return config;
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
    return sanitizePaymentShareMethodForStorage(
      paymentShareMethodConfigSchema.parse({
        key,
        shareValue: existing.shareValue ?? "",
        qrImageUrl: existing.qrImageUrl ?? null,
        instructions: existing.instructions ?? null
      })
    );
  });
}

export function resolvePaymentShareConfig(
  methods: PaymentShareMethodConfig[],
  key: PaymentShareMethodKey
): PaymentShareMethodConfig {
  const found = methods.find((m) => m.key === key);
  const base = found ?? { key, shareValue: "", qrImageUrl: null, instructions: null };
  return applyCodeOwnedQrConfig(base);
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
