import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  useLeadQuery,
  useMarkPaymentMutation,
  usePatchLeadMutation,
  usePortalSettingsQuery,
  useSessionQuery,
  useTransitionLeadMutation,
  useUsersQuery,
  useVerifyPaymentMutation
} from "../hooks/useSalesQueries";
import {
  getAllowedTransitions,
  canMarkAdvance,
  canMarkFinal,
  isLeadTerminal
} from "../lib/leadUi";
import { formatMinorUnits, parseRupeeInputToCents } from "../lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { PaymentKind } from "../types";
import { QueryErrorAlert } from "../components/QueryErrorAlert";

const VERIFY_ADMIN_NOTE_MAX = 2000;

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSessionQuery();
  const {
    data: settingsRes,
    isLoading: settingsLoading,
    isError: settingsError,
    refetch: refetchSettings
  } = usePortalSettingsQuery();
  const { data, isLoading, isError, refetch: refetchLead } = useLeadQuery(id);
  const {
    data: usersData,
    isError: usersError,
    isLoading: usersLoading,
    refetch: refetchUsers
  } = useUsersQuery(1, 100, session?.user?.role === "ADMIN");

  const lead = data?.lead;
  const settings = settingsRes?.settings;
  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";

  const patch = usePatchLeadMutation(id ?? "");
  const transition = useTransitionLeadMutation(id ?? "");
  const markPay = useMarkPaymentMutation(id ?? "");

  const [payKind, setPayKind] = useState<PaymentKind>("ADVANCE");
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");

  useEffect(() => {
    if (!lead || !settings) return;
    const adv = canMarkAdvance(lead, settings);
    const fin = canMarkFinal(lead, settings);
    setPayKind((prev) => {
      if (adv && fin) return prev;
      if (adv && !fin) return "ADVANCE";
      if (!adv && fin) return "FINAL";
      return prev;
    });
  }, [lead, settings]);

  const editForm = useForm({
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      notes: "",
      advanceRupees: "",
      finalQuoteRupees: "",
      assignedToUserId: ""
    },
    values: lead
      ? {
          clientName: lead.clientName,
          clientEmail: lead.clientEmail ?? "",
          clientPhone: lead.clientPhone ?? "",
          notes: lead.notes ?? "",
          advanceRupees:
            lead.advanceAmountCents != null ? String(lead.advanceAmountCents / 100) : "",
          finalQuoteRupees:
            lead.finalQuoteCents != null ? String(lead.finalQuoteCents / 100) : "",
          assignedToUserId: lead.assignedToUserId ?? ""
        }
      : undefined
  });

  const reps =
    usersData?.items.filter((u) => u.role === "SALES_REP" && u.isActive) ?? [];

  const terminal = lead && settings ? isLeadTerminal(lead, settings) : false;
  const transitions =
    lead && settings && role ? getAllowedTransitions(settings, lead, role) : [];

  if (isLoading || settingsLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (settingsError || !settings) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {settingsError ? (
          <QueryErrorAlert
            message="Could not load portal settings."
            onRetry={() => void refetchSettings()}
          />
        ) : (
          <p className="text-destructive">Could not load portal settings.</p>
        )}
        <Button asChild variant="link" className="mt-2">
          <Link to="/portal/leads">Back to leads</Link>
        </Button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <QueryErrorAlert
          message="Could not load this lead."
          onRetry={() => void refetchLead()}
        />
        <Button asChild variant="link">
          <Link to="/portal/leads">Back to leads</Link>
        </Button>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-destructive">Lead not found or no access.</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/portal/leads">Back to leads</Link>
        </Button>
      </div>
    );
  }

  const showMarkAdvance = canMarkAdvance(lead, settings);
  const showMarkFinal = canMarkFinal(lead, settings);

  const paymentKindOptions: PaymentKind[] = [
    ...(showMarkAdvance ? (["ADVANCE"] as const) : []),
    ...(showMarkFinal ? (["FINAL"] as const) : [])
  ];
  const payKindForUi = paymentKindOptions.includes(payKind)
    ? payKind
    : (paymentKindOptions[0] ?? "ADVANCE");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" className="min-h-11" asChild>
          <Link to="/portal/leads">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Leads
          </Link>
        </Button>
        <Badge variant="secondary">{lead.status.replace(/_/g, " ")}</Badge>
        {terminal && <span className="text-sm text-muted-foreground">(read-only)</span>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client & quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={editForm.handleSubmit((vals) => {
              if (terminal) return;
              let ok = true;
              if (
                vals.advanceRupees.trim() !== "" &&
                parseRupeeInputToCents(vals.advanceRupees) === null
              ) {
                editForm.setError("advanceRupees", { message: "Enter a valid amount" });
                ok = false;
              }
              if (
                vals.finalQuoteRupees.trim() !== "" &&
                parseRupeeInputToCents(vals.finalQuoteRupees) === null
              ) {
                editForm.setError("finalQuoteRupees", { message: "Enter a valid amount" });
                ok = false;
              }
              if (!ok) return;
              const adv = parseRupeeInputToCents(vals.advanceRupees);
              const fin = parseRupeeInputToCents(vals.finalQuoteRupees);
              const body: Record<string, unknown> = {
                clientName: vals.clientName,
                clientEmail: vals.clientEmail.trim() === "" ? null : vals.clientEmail,
                clientPhone: vals.clientPhone.trim() === "" ? null : vals.clientPhone,
                notes: vals.notes.trim() === "" ? null : vals.notes,
                advanceAmountCents: adv,
                finalQuoteCents: fin
              };
              if (isAdmin) {
                body.assignedToUserId =
                  vals.assignedToUserId === "" ? null : vals.assignedToUserId;
              }
              patch.mutate(body);
            })}
          >
            <div className="space-y-2 sm:col-span-2">
              <Label>Client name</Label>
              <Input className="min-h-11" {...editForm.register("clientName")} disabled={terminal} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input className="min-h-11" {...editForm.register("clientEmail")} disabled={terminal} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input className="min-h-11" {...editForm.register("clientPhone")} disabled={terminal} />
            </div>
            <div className="space-y-2">
              <Label>Advance (₹)</Label>
              <Input
                className="min-h-11"
                {...editForm.register("advanceRupees")}
                disabled={terminal}
              />
              {editForm.formState.errors.advanceRupees && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.advanceRupees.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Final quote (₹)</Label>
              <Input
                className="min-h-11"
                {...editForm.register("finalQuoteRupees")}
                disabled={terminal}
              />
              {editForm.formState.errors.finalQuoteRupees && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.finalQuoteRupees.message}
                </p>
              )}
            </div>
            {isAdmin && (
              <div className="space-y-2 sm:col-span-2">
                <Label>Assigned sales rep</Label>
                {usersError && (
                  <QueryErrorAlert
                    message="Could not load sales reps."
                    onRetry={() => void refetchUsers()}
                  />
                )}
                {!usersError && !usersLoading && reps.length === 0 && (
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
                    No active sales reps.{" "}
                    <Link className="font-semibold underline underline-offset-2" to="/portal/users">
                      Add a user
                    </Link>{" "}
                    first.
                  </p>
                )}
                <Select
                  value={editForm.watch("assignedToUserId") || "__none__"}
                  onValueChange={(v) =>
                    editForm.setValue("assignedToUserId", v === "__none__" ? "" : v)
                  }
                  disabled={terminal || usersLoading || usersError}
                >
                  <SelectTrigger className="min-h-11">
                    <SelectValue
                      placeholder={usersLoading ? "Loading reps…" : "Unassigned"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Unassigned</SelectItem>
                    {reps.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.displayName ?? u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea rows={4} {...editForm.register("notes")} disabled={terminal} />
            </div>
            {!terminal && (
              <Button type="submit" className="min-h-11 sm:col-span-2" disabled={patch.isPending}>
                Save changes
              </Button>
            )}
          </form>
          <div className="mt-4 space-y-1 border-t pt-4 text-sm text-muted-foreground">
            <p>
              Created by <span className="font-mono text-xs">{lead.createdByUserId}</span>
            </p>
            <p>
              Assigned to{" "}
              {lead.assignedToUserId ? (
                <span className="font-mono text-xs">{lead.assignedToUserId}</span>
              ) : (
                "—"
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {!terminal && transitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status transition</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {transitions.map((t) => (
              <Button
                key={`${t.from}-${t.to}`}
                variant="secondary"
                className="min-h-11"
                disabled={transition.isPending}
                onClick={() => transition.mutate({ toStatus: t.to })}
              >
                → {t.to.replace(/_/g, " ")}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {!terminal && (showMarkAdvance || showMarkFinal) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mark payment (pending verification)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label>Kind</Label>
                <Select
                  value={payKindForUi}
                  onValueChange={(v) => setPayKind(v as PaymentKind)}
                >
                  <SelectTrigger className="min-h-11 min-w-0 w-full max-w-[12rem] sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {showMarkAdvance && <SelectItem value="ADVANCE">Advance</SelectItem>}
                    {showMarkFinal && <SelectItem value="FINAL">Final</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                  className="min-h-11 min-w-0 w-full max-w-[12rem] sm:w-40"
                  inputMode="decimal"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rep note</Label>
              <Input
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
                  kind: payKindForUi,
                  amountCents: cents,
                  repNote: payNote.trim() === "" ? null : payNote
                });
                setPayAmount("");
                setPayNote("");
              }}
            >
              Mark payment
            </Button>
          </CardContent>
        </Card>
      )}

      {lead.payments && lead.payments.length > 0 && (
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
                  <TableHead>Kind</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marked</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lead.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.kind}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMinorUnits(p.amountCents)}
                    </TableCell>
                    <TableCell>{p.verificationStatus}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(p.markedAt).toLocaleString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {p.verificationStatus === "PENDING" ? (
                          <PendingPaymentVerifyActions paymentId={p.id} />
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

      {lead.commission && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Commission</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              Amount: {formatMinorUnits(lead.commission.amountCents)} · Paid:{" "}
              {lead.commission.isPaid ? "Yes" : "No"}
            </p>
            <Button asChild variant="link" className="h-auto px-0">
              <Link to="/portal/commissions">View in commissions</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {lead.project && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="min-h-11">
              <Link to={`/portal/projects/${lead.project.id}`}>{lead.project.title}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PendingPaymentVerifyActions({ paymentId }: { paymentId: string }) {
  const { id: leadId } = useParams<{ id: string }>();
  const verify = useVerifyPaymentMutation(leadId ?? "");
  const pending = verify.isPending;

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [verifyNote, setVerifyNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  const noteOrNull = (s: string) => {
    const t = s.trim();
    return t === "" ? null : t;
  };

  return (
    <div className="flex flex-wrap gap-2">
      <AlertDialog
        open={verifyOpen}
        onOpenChange={(o) => {
          setVerifyOpen(o);
          if (!o) setVerifyNote("");
        }}
      >
        <AlertDialogTrigger asChild>
          <Button size="sm" className="min-h-11" disabled={pending}>
            Verify
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-h-[85dvh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Verify payment?</AlertDialogTitle>
            <AlertDialogDescription>
              Marks this payment as verified and updates the lead per portal rules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`verify-note-${paymentId}`}>Admin note (optional)</Label>
            <Textarea
              id={`verify-note-${paymentId}`}
              maxLength={VERIFY_ADMIN_NOTE_MAX}
              value={verifyNote}
              onChange={(e) => setVerifyNote(e.target.value)}
              rows={3}
              className="resize-y"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() =>
                verify.mutate({
                  paymentId,
                  body: {
                    decision: "VERIFIED",
                    adminNote: noteOrNull(verifyNote)
                  }
                })
              }
            >
              Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={rejectOpen}
        onOpenChange={(o) => {
          setRejectOpen(o);
          if (!o) setRejectNote("");
        }}
      >
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive" className="min-h-11" disabled={pending}>
            Reject
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-h-[85dvh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Reject payment?</AlertDialogTitle>
            <AlertDialogDescription>
              The payment will stay on record as rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`reject-note-${paymentId}`}>Admin note (optional)</Label>
            <Textarea
              id={`reject-note-${paymentId}`}
              maxLength={VERIFY_ADMIN_NOTE_MAX}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              className="resize-y"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                verify.mutate({
                  paymentId,
                  body: {
                    decision: "REJECTED",
                    adminNote: noteOrNull(rejectNote)
                  }
                })
              }
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
