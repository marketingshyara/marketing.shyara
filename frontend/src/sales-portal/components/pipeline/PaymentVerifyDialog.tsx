import { useState } from "react";
import { toast } from "sonner";
import { StageModalShell } from "./StageModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LeadPayment } from "../../types";
import { formatMinorUnits } from "../../lib/money";
import { paymentKindLabel } from "../../lib/copy";
import type { VerifyPaymentRequestBody } from "../../api/salesApi";

type Props = {
  payment: LeadPayment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (paymentId: string, body: VerifyPaymentRequestBody) => void;
  isPending: boolean;
  clientName?: string;
  templateLabel?: string | null;
  agreedTotalCents?: number | null;
};

export function PaymentVerifyDialog({
  payment,
  open,
  onOpenChange,
  onVerify,
  isPending,
  clientName,
  templateLabel,
  agreedTotalCents
}: Props) {
  const [ref, setRef] = useState("");
  const [note, setNote] = useState("");

  if (!payment) return null;

  return (
    <StageModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={`Verify ${paymentKindLabel(payment.kind)} payment`}
      description={`Amount: ${formatMinorUnits(payment.amountCents)}`}
      footer={
        <>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11 w-full sm:w-auto"
            disabled={isPending}
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
            disabled={isPending || !ref.trim()}
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
        </>
      }
    >
      <div className="space-y-3">
        {clientName ? (
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Client</dt>
              <dd className="font-medium">{clientName}</dd>
            </div>
            {templateLabel ? (
              <div>
                <dt className="text-muted-foreground">Template</dt>
                <dd>{templateLabel}</dd>
              </div>
            ) : null}
            {agreedTotalCents != null ? (
              <div>
                <dt className="text-muted-foreground">Agreed total</dt>
                <dd>{formatMinorUnits(agreedTotalCents)}</dd>
              </div>
            ) : null}
            {payment.repNote ? (
              <div>
                <dt className="text-muted-foreground">Rep note</dt>
                <dd>{payment.repNote}</dd>
              </div>
            ) : null}
            {payment.verificationStatus === "VERIFIED" && payment.externalReference ? (
              <div>
                <dt className="text-muted-foreground">Razorpay reference</dt>
                <dd className="font-mono text-xs">{payment.externalReference}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
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
          <Textarea id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
    </StageModalShell>
  );
}
