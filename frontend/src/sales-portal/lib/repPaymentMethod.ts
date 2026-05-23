import type { Lead, PaymentKind } from "../types";
import {
  isPaymentShareMethodKey,
  type PaymentShareMethodKey
} from "./paymentShareMethods";

/** Restore method from pending or latest rejected payment when rep resubmits. */
export function repPaymentMethodFromLead(
  lead: Lead,
  kind: PaymentKind
): PaymentShareMethodKey | "" {
  const payments = lead.payments ?? [];
  const pending = payments.find(
    (p) => p.kind === kind && p.verificationStatus === "PENDING"
  );
  if (pending?.repNote && isPaymentShareMethodKey(pending.repNote)) {
    return pending.repNote;
  }
  const rejected = [...payments]
    .filter((p) => p.kind === kind && p.verificationStatus === "REJECTED")
    .sort((a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime());
  const latestRejected = rejected[0];
  if (latestRejected?.repNote && isPaymentShareMethodKey(latestRejected.repNote)) {
    return latestRejected.repNote;
  }
  return "";
}
