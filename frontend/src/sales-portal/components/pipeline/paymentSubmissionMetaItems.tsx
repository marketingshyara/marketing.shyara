import type { ReactNode } from "react";
import type { Lead, LeadPayment, PaymentKind, PaymentShareMethodConfig } from "../../types";
import type { PortalMetaItem } from "../ui/PortalMetaGrid";
import { formatMinorUnits } from "../../lib/money";
import {
  isPaymentShareMethodKey,
  paymentReferenceFieldCopy,
  paymentShareMethodLabel,
  resolvePaymentShareConfig
} from "../../lib/paymentShareMethods";
import { PaymentMethodSharePanel } from "./PaymentMethodField";

export type PaymentSubmissionLead = Pick<
  Lead,
  | "clientName"
  | "agreedTotalCents"
  | "advanceAmountCents"
  | "finalQuoteCents"
  | "payments"
>;

function moneyValue(cents: number | null | undefined): ReactNode {
  return <span className="tabular-nums">{formatMinorUnits(cents)}</span>;
}

function formatMarkedAt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export function pendingPaymentForKind(
  lead: Pick<Lead, "payments">,
  kind: PaymentKind
): LeadPayment | undefined {
  return lead.payments?.find(
    (p) => p.kind === kind && p.verificationStatus === "PENDING"
  );
}

export function quotedCentsForPaymentKind(
  lead: Pick<Lead, "advanceAmountCents" | "finalQuoteCents">,
  kind: PaymentKind
): number | null {
  return kind === "ADVANCE" ? lead.advanceAmountCents : lead.finalQuoteCents;
}

export function paymentAmountMismatchMessage(
  lead: Pick<Lead, "advanceAmountCents" | "finalQuoteCents">,
  payment: LeadPayment
): string | null {
  const quoted = quotedCentsForPaymentKind(lead, payment.kind);
  if (quoted == null || quoted <= 0) return null;
  if (payment.amountCents !== quoted) {
    return payment.kind === "ADVANCE"
      ? "Submitted advance does not match the quoted advance on this deal."
      : "Submitted due amount does not match the quoted due amount on this deal.";
  }
  return null;
}

function advanceStatusSuffix(lead: Pick<Lead, "payments">): string {
  const payments = lead.payments ?? [];
  if (payments.some((p) => p.kind === "ADVANCE" && p.verificationStatus === "VERIFIED")) {
    return " · verified";
  }
  if (payments.some((p) => p.kind === "ADVANCE" && p.verificationStatus === "PENDING")) {
    return " · pending verification";
  }
  return "";
}

function amountUnderReviewLabel(kind: PaymentKind): string {
  return kind === "ADVANCE" ? "Advance amount" : "Due amount";
}

export type PaymentSubmissionMetaOptions = {
  templateLabel?: string | null;
  includeClient?: boolean;
  /** When false, only payment submission rows (amount, method, submitted at). Default true. */
  includeDealContext?: boolean;
};

/** Minimal rows when lead detail has not loaded yet (e.g. admin queue). */
export function paymentFallbackMetaItems(payment: LeadPayment): PortalMetaItem[] {
  return [
    {
      label: amountUnderReviewLabel(payment.kind),
      value: moneyValue(payment.amountCents)
    },
    {
      label: "Payment method",
      value: payment.repNote
        ? isPaymentShareMethodKey(payment.repNote)
          ? paymentShareMethodLabel(payment.repNote)
          : payment.repNote
        : "—"
    },
    { label: "Submitted at", value: formatMarkedAt(payment.markedAt) }
  ];
}

export function paymentSubmissionMetaItems(
  lead: PaymentSubmissionLead,
  payment: LeadPayment,
  options: PaymentSubmissionMetaOptions = {}
): PortalMetaItem[] {
  const items: PortalMetaItem[] = [];
  const includeDeal = options.includeDealContext !== false;

  if (includeDeal && options.includeClient) {
    items.push({ label: "Client", value: lead.clientName });
  }
  if (includeDeal && options.templateLabel) {
    items.push({ label: "Template", value: options.templateLabel });
  }

  if (includeDeal) {
    items.push({
      label: "Agreed total",
      value: moneyValue(lead.agreedTotalCents)
    });

    const advanceSuffix = advanceStatusSuffix(lead);
    items.push({
      label: "Advance",
      value:
        lead.advanceAmountCents != null ? (
          <span className="tabular-nums">
            {formatMinorUnits(lead.advanceAmountCents)}
            {advanceSuffix}
          </span>
        ) : (
          "—"
        )
    });
  }

  items.push({
    label: amountUnderReviewLabel(payment.kind),
    value: moneyValue(payment.amountCents)
  });

  items.push({
    label: "Payment method",
    value: payment.repNote
      ? isPaymentShareMethodKey(payment.repNote)
        ? paymentShareMethodLabel(payment.repNote)
        : payment.repNote
      : "—"
  });

  items.push({
    label: "Submitted at",
    value: formatMarkedAt(payment.markedAt)
  });

  if (payment.verificationStatus === "VERIFIED" && payment.externalReference) {
    items.push({
      label: paymentReferenceFieldCopy(payment.repNote).verifiedLabel,
      value: (
        <span className="break-all font-mono text-xs tabular-nums">
          {payment.externalReference}
        </span>
      )
    });
  }

  if (payment.verificationStatus === "REJECTED" && payment.adminNote) {
    items.push({ label: "Decline reason", value: payment.adminNote });
  }

  if (payment.verificationStatus === "REJECTED" && payment.verifiedAt) {
    items.push({
      label: "Declined at",
      value: formatMarkedAt(payment.verifiedAt)
    });
  }

  return items;
}

export function paymentMethodSharePanelForPayment(
  payment: LeadPayment,
  methods: PaymentShareMethodConfig[]
): ReactNode | null {
  if (!payment.repNote || !isPaymentShareMethodKey(payment.repNote)) return null;
  const config = resolvePaymentShareConfig(methods, payment.repNote);
  return <PaymentMethodSharePanel config={config} />;
}

/** Rep waiting banner: amount from pending payment row when available. */
export function repPaymentWaitingDetail(
  waitingStageKey: string | undefined,
  lead: PaymentSubmissionLead
): string | null {
  if (waitingStageKey === "final_payment") {
    const pending = pendingPaymentForKind(lead, "FINAL");
    const cents = pending?.amountCents ?? lead.finalQuoteCents;
    if (cents != null && cents > 0) {
      return `Due ${formatMinorUnits(cents)} submitted — waiting for admin verification`;
    }
  }
  if (waitingStageKey === "convert_deal") {
    const pending = pendingPaymentForKind(lead, "ADVANCE");
    const cents = pending?.amountCents ?? lead.advanceAmountCents;
    if (cents != null && cents > 0) {
      return `Advance ${formatMinorUnits(cents)} submitted — waiting for admin verification`;
    }
  }
  return null;
}
