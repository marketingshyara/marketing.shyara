import { memo, useMemo } from "react";
import { PortalMetaGrid } from "../ui/PortalMetaGrid";
import type { PaymentShareMethodConfig, LeadPayment } from "../../types";
import {
  paymentAmountMismatchMessage,
  paymentFallbackMetaItems,
  paymentMethodSharePanelForPayment,
  paymentSubmissionMetaItems,
  type PaymentSubmissionLead,
  type PaymentSubmissionMetaOptions
} from "./paymentSubmissionMetaItems";

type Props = {
  lead: PaymentSubmissionLead | null;
  payment: LeadPayment;
  methods: PaymentShareMethodConfig[];
  options?: PaymentSubmissionMetaOptions;
  /** Admin verify: warn when submitted cents ≠ quoted deal. */
  showMismatchAlert?: boolean;
  leadLoading?: boolean;
  className?: string;
};

export const PaymentSubmissionReviewSection = memo(function PaymentSubmissionReviewSection({
  lead,
  payment,
  methods,
  options,
  showMismatchAlert = false,
  leadLoading = false,
  className
}: Props) {
  const { includeClient, includeDealContext, templateLabel } = options ?? {};

  const mismatchMessage = useMemo(() => {
    if (!showMismatchAlert || !lead) return null;
    return paymentAmountMismatchMessage(lead, payment);
  }, [showMismatchAlert, lead, payment]);

  const metaItems = useMemo(
    () =>
      lead
        ? paymentSubmissionMetaItems(lead, payment, {
            includeClient,
            includeDealContext,
            templateLabel
          })
        : paymentFallbackMetaItems(payment),
    [lead, payment, includeClient, includeDealContext, templateLabel]
  );

  const sharePanel = useMemo(
    () => paymentMethodSharePanelForPayment(payment, methods),
    [payment, methods]
  );

  return (
    <div className={className ?? "min-w-0 space-y-3"}>
      {leadLoading && !lead ? (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Loading deal breakdown…
        </p>
      ) : null}
      <PortalMetaGrid items={metaItems} />
      {mismatchMessage ? (
        <p className="break-words text-xs text-amber-700 dark:text-amber-300" role="alert">
          {mismatchMessage} Refresh and confirm before approving.
        </p>
      ) : null}
      {sharePanel ? <div className="min-w-0">{sharePanel}</div> : null}
    </div>
  );
});
