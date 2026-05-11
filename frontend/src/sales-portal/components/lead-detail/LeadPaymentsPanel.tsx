import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useMarkPaymentMutation } from "../../hooks/useSalesQueries";
import { canMarkAdvance, canMarkFinal } from "../../lib/leadUi";
import { formatMinorUnits, parseRupeeInputToCents } from "../../lib/money";
import type { Lead, PaymentKind, PortalSettingsValues } from "../../types";
import { LeadVerifyDialog } from "./LeadVerifyDialog";
import { paymentKindLabel, paymentVerificationLabel } from "../../lib/copy";

type Props = {
  lead: Lead;
  settings: PortalSettingsValues;
  isAdmin: boolean;
  terminal: boolean;
};

/**
 * Renders the existing payments table plus the "Mark payment" form. The form is only mounted when
 * the FSM actually allows a new payment in this state; the previous useEffect that synced the
 * payment-kind state with derived booleans is replaced by a useMemo so we never write to state
 * during render and the dropdown is always consistent with allowed values.
 */
export function LeadPaymentsPanel({ lead, settings, isAdmin, terminal }: Props) {
  const markPay = useMarkPaymentMutation(lead.id);
  const showMarkAdvance = canMarkAdvance(lead, settings);
  const showMarkFinal = canMarkFinal(lead, settings);

  const paymentKindOptions = useMemo<PaymentKind[]>(
    () => [
      ...(showMarkAdvance ? (["ADVANCE"] as const) : []),
      ...(showMarkFinal ? (["FINAL"] as const) : [])
    ],
    [showMarkAdvance, showMarkFinal]
  );

  const [payKind, setPayKind] = useState<PaymentKind | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");

  const effectivePayKind: PaymentKind | undefined =
    payKind && paymentKindOptions.includes(payKind) ? payKind : paymentKindOptions[0];

  const showMarkForm = !terminal && paymentKindOptions.length > 0;
  const showPaymentsTable = (lead.payments?.length ?? 0) > 0;

  if (!showMarkForm && !showPaymentsTable) {
    return null;
  }

  return (
    <>
      {showMarkForm && effectivePayKind && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Record Payment (Awaiting Approval)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label htmlFor={`pay-kind-${lead.id}`}>Payment Type</Label>
                <Select
                  value={effectivePayKind}
                  onValueChange={(v) => setPayKind(v as PaymentKind)}
                >
                  <SelectTrigger
                    id={`pay-kind-${lead.id}`}
                    className="min-h-11 min-w-0 w-full max-w-[12rem] sm:w-40"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {showMarkAdvance && <SelectItem value="ADVANCE">Advance</SelectItem>}
                    {showMarkFinal && <SelectItem value="FINAL">Final</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`pay-amount-${lead.id}`}>Amount (₹)</Label>
                <Input
                  id={`pay-amount-${lead.id}`}
                  className="min-h-11 min-w-0 w-full max-w-[12rem] sm:w-40"
                  inputMode="decimal"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`pay-note-${lead.id}`}>Sales Note (Optional)</Label>
              <Input
                id={`pay-note-${lead.id}`}
                className="min-h-11"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
              />
            </div>
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={markPay.isPending}
              onClick={() => {
                if (payAmount.trim() === "") {
                  toast.error("Enter an amount.");
                  return;
                }
                const cents = parseRupeeInputToCents(payAmount);
                if (cents === null) {
                  toast.error("Enter a valid amount.");
                  return;
                }
                if (cents <= 0) {
                  toast.error("Amount must be greater than zero.");
                  return;
                }
                markPay.mutate({
                  kind: effectivePayKind,
                  amountCents: cents,
                  repNote: payNote.trim() === "" ? null : payNote
                });
                setPayAmount("");
                setPayNote("");
              }}
            >
              Record Payment
            </Button>
          </CardContent>
        </Card>
      )}

      {showPaymentsTable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payments</CardTitle>
          </CardHeader>
          <CardContent className="px-1">
            <div
              className="-mx-1 overflow-x-auto rounded-md [-webkit-overflow-scrolling:touch] px-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              tabIndex={0}
              aria-label="Payments (scroll horizontally on small screens)"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Marked</TableHead>
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lead.payments!.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{paymentKindLabel(p.kind)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMinorUnits(p.amountCents)}
                      </TableCell>
                      <TableCell>{paymentVerificationLabel(p.verificationStatus)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(p.markedAt).toLocaleString()}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          {p.verificationStatus === "PENDING" ? (
                            <LeadVerifyDialog leadId={lead.id} paymentId={p.id} />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
