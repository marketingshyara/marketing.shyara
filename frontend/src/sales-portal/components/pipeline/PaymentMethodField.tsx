import { memo, useMemo } from "react";
import {
  Copy,
  ExternalLink,
  Globe,
  Link2,
  QrCode,
  Smartphone,
  AlertTriangle
} from "lucide-react";
import { copyToClipboard } from "../../lib/copyToClipboard";
import { PortalLinkDisplay } from "../ui/PortalLinkDisplay";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { tryNormalizeHttpUrl } from "../../lib/httpUrl";
import type { PaymentShareMethodConfig, PaymentShareMethodKey } from "../../types";
import {
  PAYMENT_SHARE_METHOD_KEYS,
  PAYMENT_SHARE_METHOD_LABELS,
  paymentShareMethodKind,
  paymentShareMethodsByKey,
  resolvePaymentShareConfig
} from "../../lib/paymentShareMethods";

type Props = {
  id?: string;
  value: PaymentShareMethodKey | "";
  onChange: (key: PaymentShareMethodKey) => void;
  methods: PaymentShareMethodConfig[];
  disabled?: boolean;
};

const METHOD_ICONS = {
  upi_id: Smartphone,
  razorpay_qr: QrCode,
  sbi_qr: QrCode,
  razorpay_payment_link: Link2,
  razorpay_payment_page: Globe
} as const satisfies Record<PaymentShareMethodKey, typeof Smartphone>;

function safeOpenHref(raw: string): string | null {
  return tryNormalizeHttpUrl(raw.trim());
}

type SharePanelProps = {
  config: PaymentShareMethodConfig;
};

export const PaymentMethodSharePanel = memo(function PaymentMethodSharePanel({
  config
}: SharePanelProps) {
  const kind = paymentShareMethodKind(config.key);
  const shareValue = config.shareValue.trim();
  const qrUrl = config.qrImageUrl?.trim() || "";
  const linkHref = kind === "url" ? safeOpenHref(shareValue) : null;
  const qrHref = qrUrl ? safeOpenHref(qrUrl) : null;
  const hasShareValue = shareValue.length > 0;
  const hasQr = qrHref != null;

  if (!hasShareValue && !hasQr) {
    return (
      <div
        className="flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-950 dark:text-amber-100"
        role="status"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>Ask admin to configure this method in Portal Settings before sharing with clients.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3" aria-live="polite">
      {config.instructions?.trim() ? (
        <p className="text-sm text-muted-foreground">{config.instructions.trim()}</p>
      ) : null}

      {kind === "upi" && hasShareValue ? (
        <ShareValueRow label="UPI ID" value={shareValue} copyLabel="UPI ID" />
      ) : null}

      {kind === "url" && hasShareValue ? (
        linkHref ? (
          <PortalLinkDisplay url={shareValue} copyLabel="Payment link" variant="plain" />
        ) : (
          <p className="text-xs text-amber-700 dark:text-amber-300" role="status">
            Payment URL in settings is invalid. Ask admin to fix it in Portal Settings.
          </p>
        )
      ) : null}

      {kind === "qr" ? (
        <div className="space-y-3">
          {hasQr ? (
            <div className="flex w-full max-w-full flex-col items-start gap-2">
              <img
                src={qrHref}
                alt={`${PAYMENT_SHARE_METHOD_LABELS[config.key]} QR code`}
                loading="lazy"
                decoding="async"
                className="h-auto max-h-48 w-full max-w-[12rem] rounded-md border object-contain"
              />
              <Button type="button" variant="outline" size="sm" className="min-h-11 w-full sm:w-auto" asChild>
                <a href={qrHref} target="_blank" rel="noreferrer noopener">
                  <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                  Open QR
                </a>
              </Button>
            </div>
          ) : null}
          {hasShareValue ? (
            <ShareValueRow label="Details" value={shareValue} copyLabel="Details" />
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

function ShareValueRow({
  label,
  value,
  copyLabel
}: {
  label: string;
  value: string;
  copyLabel: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 break-all font-mono text-sm">{value}</code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 w-full shrink-0 sm:w-auto"
          onClick={() => void copyToClipboard(value, copyLabel)}
        >
          <Copy className="mr-2 h-4 w-4" aria-hidden />
          Copy
        </Button>
      </div>
    </div>
  );
}

export function PaymentMethodField({
  id = "payment-method",
  value,
  onChange,
  methods,
  disabled
}: Props) {
  const selected = value ? resolvePaymentShareConfig(methods, value) : undefined;
  const fieldDisabled = disabled ?? false;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Payment method</Label>
      <p className="text-xs text-muted-foreground">
        Choose how you shared payment details with the client.
      </p>
      <Select
        value={value || "__none__"}
        onValueChange={(v) => {
          if (v !== "__none__") onChange(v as PaymentShareMethodKey);
        }}
        disabled={fieldDisabled}
      >
        <SelectTrigger id={id} className="min-h-11 w-full">
          <SelectValue placeholder="Select payment method" />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-[min(60dvh,20rem)] w-[var(--radix-select-trigger-width)]">
          {PAYMENT_SHARE_METHOD_KEYS.map((key) => {
            const Icon = METHOD_ICONS[key];
            return (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                  {PAYMENT_SHARE_METHOD_LABELS[key]}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {selected && !fieldDisabled ? <PaymentMethodSharePanel config={selected} /> : null}
      {selected && fieldDisabled && value ? (
        <p className="text-sm text-muted-foreground">
          Method: {PAYMENT_SHARE_METHOD_LABELS[value]}
        </p>
      ) : null}
    </div>
  );
}

/** Resources page: one card per configured method. */
export function PaymentMethodsResourceList({ methods }: { methods: PaymentShareMethodConfig[] }) {
  const methodsByKey = useMemo(() => paymentShareMethodsByKey(methods), [methods]);

  return (
    <div className="space-y-3">
      {PAYMENT_SHARE_METHOD_KEYS.map((key) => {
        const config = methodsByKey.get(key) ?? resolvePaymentShareConfig(methods, key);
        const Icon = METHOD_ICONS[key];
        return (
          <div key={key} className="space-y-2 rounded-lg border p-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              {PAYMENT_SHARE_METHOD_LABELS[key]}
            </p>
            <PaymentMethodSharePanel config={config} />
          </div>
        );
      })}
    </div>
  );
}
