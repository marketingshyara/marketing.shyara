import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { StageModalShell } from "./StageModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LeadPayment, PaymentShareMethodConfig } from "../../types";
import { formatMinorUnits } from "../../lib/money";
import { paymentKindLabel } from "../../lib/copy";
import type { VerifyPaymentRequestBody } from "../../api/salesApi";
import { PaymentSubmissionReviewSection } from "./PaymentSubmissionReviewSection";
import type { PaymentSubmissionLead } from "./paymentSubmissionMetaItems";

type Props = {
  payment: LeadPayment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (paymentId: string, body: VerifyPaymentRequestBody) => void;
  isPending: boolean;
  lead: PaymentSubmissionLead | null;
  templateLabel?: string | null;
  paymentShareMethods?: PaymentShareMethodConfig[];
  leadLoading?: boolean;
};

export function PaymentVerifyDialog({
  payment,
  open,
  onOpenChange,
  onVerify,
  isPending,
  lead,
  templateLabel,
  paymentShareMethods = [],
  leadLoading = false
}: Props) {
  const [ref, setRef] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open || !payment) return;
    setRef("");
    setNote("");
  }, [open, payment?.id]);

  if (!open) return null;

  if (!payment) {
    return (
      <StageModalShell
        open={open}
        onOpenChange={onOpenChange}
        title="Verify payment"
        description="Loading payment details…"
      >
        <div className="min-w-0 space-y-3" aria-busy="true">
          <Skeleton className="h-32 w-full" />
        </div>
      </StageModalShell>
    );
  }

  const isRejected = payment.verificationStatus === "REJECTED";
  const isPaymentPending = payment.verificationStatus === "PENDING";
  const amountLabel = payment.kind === "ADVANCE" ? "Advance" : "Due";

  return (
    <StageModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={
        isRejected
          ? `${paymentKindLabel(payment.kind)} payment declined`
          : `Verify ${paymentKindLabel(payment.kind)} payment`
      }
      description={`${amountLabel} payment · ${formatMinorUnits(payment.amountCents)}`}
      footer={
        isRejected ? (
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 w-full sm:w-auto"
              disabled={isPending || !isPaymentPending}
              onClick={() => {
                if (!note.trim()) {
                  toast.error("Add a short note explaining why you declined.");
                  return;
                }
                onVerify(payment.id, {
                  decision: "REJECTED",
                  adminNote: note.trim()
                });
              }}
            >
              Decline
            </Button>
            <Button
              type="button"
              className="min-h-11 w-full sm:w-auto"
              disabled={isPending || !isPaymentPending || !ref.trim()}
              onClick={() =>
                onVerify(payment.id, {
                  decision: "VERIFIED",
                  externalReference: ref.trim(),
                  adminNote: note || null
                })
              }
            >
              Approve payment
            </Button>
            {!ref.trim() ? (
              <p className="w-full break-words text-left text-xs text-muted-foreground">
                Enter the Razorpay reference to enable Approve.
              </p>
            ) : null}
          </>
        )
      }
    >
      <div className="space-y-4">
        <PaymentSubmissionReviewSection
          lead={lead}
          payment={payment}
          methods={paymentShareMethods}
          options={{
            includeClient: true,
            templateLabel: templateLabel ?? undefined
          }}
          showMismatchAlert={isPaymentPending}
          leadLoading={leadLoading}
        />
        {isRejected ? (
          <p className="break-words text-sm text-muted-foreground" role="status">
            The rep can record a new payment after reviewing the decline reason above.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="pay-ref">Razorpay reference (required to approve)</Label>
              <Input
                id="pay-ref"
                className="min-h-11"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="Razorpay payment id"
                aria-describedby="pay-ref-hint"
              />
              <p id="pay-ref-hint" className="text-xs text-muted-foreground">
                Paste the payment ID from your Razorpay dashboard.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-note">Admin note (required if declining)</Label>
              <Textarea id="pay-note" className="min-h-[5rem]" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </>
        )}
      </div>
    </StageModalShell>
  );
}
