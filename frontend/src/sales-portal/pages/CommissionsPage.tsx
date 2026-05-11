import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  useCommissionsQuery,
  useMarkCommissionPaidMutation,
  usePatchCommissionMutation,
  useSessionQuery
} from "../hooks/useSalesQueries";
import { formatMinorUnits, parseRupeeInputToCents } from "../lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { LeadStatus } from "../types";
import { QueryErrorAlert } from "../components/QueryErrorAlert";
import { leadStatusLabel } from "../lib/copy";

export function CommissionsPage() {
  const { data: session } = useSessionQuery();
  const isAdmin = session?.user?.role === "ADMIN";
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(() => Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = 20;
  const [paidFilter, setPaidFilter] = useState<"all" | "true" | "false">(
    (searchParams.get("paid") as "all" | "true" | "false" | null) ?? "all"
  );
  const [adjustAmountError, setAdjustAmountError] = useState<string | null>(null);
  const isPaid =
    paidFilter === "all" ? undefined : paidFilter === "true" ? true : false;

  const { data, isLoading, isError, refetch } = useCommissionsQuery({
    page,
    pageSize,
    isPaid
  });
  const patchCommission = usePatchCommissionMutation();
  const markPaid = useMarkCommissionPaidMutation();
  const commissionActionPending = markPaid.isPending || patchCommission.isPending;

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  useEffect(() => {
    if (data == null) return;
    const tp = Math.max(1, Math.ceil(data.total / pageSize));
    setPage((p) => Math.min(p, tp));
  }, [data, pageSize]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (page > 1) next.set("page", String(page));
    else next.delete("page");
    if (paidFilter !== "all") next.set("paid", paidFilter);
    else next.delete("paid");
    setSearchParams(next, { replace: true });
  }, [page, paidFilter, searchParams, setSearchParams]);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustCommissionId, setAdjustCommissionId] = useState<string | null>(null);

  const amountForm = useForm<{ rupees: string }>({
    defaultValues: { rupees: "" }
  });

  function openAdjust(id: string, amountCents: number) {
    setAdjustCommissionId(id);
    amountForm.reset({ rupees: String(amountCents / 100) });
    setAdjustOpen(true);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">Commissions</h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin ? "Adjust and mark paid when the lead is deployed." : "Your commissions."}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="commission-paid-filter">Payment Status</Label>
        <Select value={paidFilter} onValueChange={(v) => setPaidFilter(v as typeof paidFilter)}>
        <SelectTrigger id="commission-paid-filter" className="min-h-11 w-full sm:w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="false">Unpaid</SelectItem>
          <SelectItem value="true">Paid</SelectItem>
        </SelectContent>
      </Select>
      </div>

      {isError && (
        <QueryErrorAlert
          message="Could not load commissions."
          onRetry={() => void refetch()}
        />
      )}

      {isLoading && <Skeleton className="h-64 w-full" />}

      <div className="space-y-3 md:hidden">
        {data?.items.map((row) => (
          <div
            key={row.id}
            className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <Link
                to={`/portal/leads/${row.leadId}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {row.lead.clientName}
              </Link>
              <Badge variant={row.isPaid ? "secondary" : "outline"}>
                {row.isPaid ? "Paid" : "Unpaid"}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {leadStatusLabel(row.lead.status)}
            </p>
            <p className="mt-1 tabular-nums font-medium">{formatMinorUnits(row.amountCents)}</p>
            {isAdmin && !row.isPaid && row.lead.status !== "COMMISSION_PAID" && (
              <div className="mt-3 flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 w-full sm:w-auto"
                  disabled={commissionActionPending}
                  onClick={() => openAdjust(row.id, row.amountCents)}
                >
                  Adjust
                </Button>
                {row.lead.status === "DEPLOYED" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        className="min-h-11 w-full sm:w-auto"
                        disabled={commissionActionPending}
                      >
                        Mark paid
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-h-[85dvh] overflow-y-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mark commission paid?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This marks the commission as paid and moves the lead to Commission Settled.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={markPaid.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={markPaid.isPending}
                          onClick={() => markPaid.mutate(row.id)}
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="-mx-1 hidden overflow-x-auto rounded-md border px-1 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Lead status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Paid</TableHead>
              {isAdmin && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Link
                    to={`/portal/leads/${row.leadId}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {row.lead.clientName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {leadStatusLabel(row.lead.status as LeadStatus)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMinorUnits(row.amountCents)}
                </TableCell>
                <TableCell>{row.isPaid ? "Yes" : "No"}</TableCell>
                {isAdmin && (
                  <TableCell>
                    {!row.isPaid && row.lead.status !== "COMMISSION_PAID" && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="min-h-11"
                          disabled={commissionActionPending}
                          onClick={() => openAdjust(row.id, row.amountCents)}
                        >
                          Adjust
                        </Button>
                        {row.lead.status === "DEPLOYED" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="min-h-11" disabled={commissionActionPending}>
                                Mark paid
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-h-[85dvh] overflow-y-auto">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Mark commission paid?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  The lead must be at Site Deployed. This marks the lead stage as Commission Settled.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={markPaid.isPending}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  disabled={markPaid.isPending}
                                  onClick={() => markPaid.mutate(row.id)}
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={adjustOpen}
        onOpenChange={(open) => {
          setAdjustOpen(open);
          if (!open) setAdjustCommissionId(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adjust commission amount</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={amountForm.handleSubmit((v) => {
              const cents = parseRupeeInputToCents(String(v.rupees ?? ""));
              if (!adjustCommissionId) return;
              if (cents == null || cents <= 0) {
                setAdjustAmountError("Enter a valid amount greater than 0.");
                return;
              }
              setAdjustAmountError(null);
              patchCommission.mutate(
                { id: adjustCommissionId, amountCents: cents },
                {
                  onSuccess: () => {
                    setAdjustOpen(false);
                    setAdjustCommissionId(null);
                  }
                }
              );
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="adjust-commission-amount">Amount (₹)</Label>
              <Input id="adjust-commission-amount" className="min-h-11" {...amountForm.register("rupees")} />
              {adjustAmountError && <p className="text-sm text-destructive">{adjustAmountError}</p>}
            </div>
            <Button type="submit" className="min-h-11 w-full" disabled={patchCommission.isPending}>
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {data && totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center justify-center gap-2"
          aria-label="Commissions pagination"
        >
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="min-h-11"
          >
            Previous
          </Button>
          <span className="w-full basis-full px-2 text-center text-sm text-muted-foreground sm:w-auto sm:basis-auto">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="min-h-11"
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
