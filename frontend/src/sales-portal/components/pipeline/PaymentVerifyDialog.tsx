import { useState } from "react";
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
};

export function PaymentVerifyDialog({ payment, open, onOpenChange, onVerify, isPending }: Props) {
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
            onClick={() =>
              onVerify(payment.id, {
                decision: "REJECTED",
                adminNote: note || null
              })
            }
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
        <div className="space-y-2">
          <Label htmlFor="pay-ref">Provider reference (required)</Label>
          <Input
            id="pay-ref"
            className="min-h-11"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="Razorpay payment id"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pay-note">Admin note (optional)</Label>
          <Textarea id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
    </StageModalShell>
  );
}
