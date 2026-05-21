import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  errToast,
  useLeadQuery,
  usePendingPaymentsQuery,
  useVerifyPaymentMutation
} from "../../hooks/useSalesQueries";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { PortalPageHeader } from "../../components/PortalPageHeader";
import { PaymentVerifyDialog } from "../../components/pipeline/PaymentVerifyDialog";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMinorUnits } from "../../lib/money";
import { paymentKindLabel } from "../../lib/copy";
import type { VerifyPaymentRequestBody } from "../../api/salesApi";

export function PendingPaymentsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [kind, setKind] = useState<"all" | "ADVANCE" | "FINAL">("all");
  const [verifyTarget, setVerifyTarget] = useState<{
    leadId: string;
    paymentId: string;
    repId: string | null;
  } | null>(null);

  useEffect(() => {
    setPage(1);
  }, [kind]);

  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = usePendingPaymentsQuery({
    page,
    pageSize,
    kind: kind === "all" ? undefined : kind
  });

  const leadQr = useLeadQuery(verifyTarget?.leadId, !!verifyTarget?.leadId);
  const payment =
    verifyTarget && leadQr.data?.lead.payments
      ? leadQr.data.lead.payments.find((p) => p.id === verifyTarget.paymentId) ?? null
      : null;

  const verifyPay = useVerifyPaymentMutation(verifyTarget?.leadId ?? "", verifyTarget?.repId);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PortalPageHeader
        title="Payments"
        description={
          <>
            Advance and due payments only. For demo, deployment, repo, and other steps, use Reviews.
            <Button variant="link" className="mt-1 h-auto min-h-11 px-0 text-sm" asChild>
              <Link to="/portal/reviews">Open reviews queue</Link>
            </Button>
          </>
        }
        toolbar={
          <DataStaleToolbar
            dataUpdatedAt={dataUpdatedAt}
            onRefresh={() => void refetch()}
            isFetching={isFetching}
          />
        }
      />

      <Select value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
        <SelectTrigger className="min-h-11 w-full sm:w-[200px]" aria-label="Payment type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="ADVANCE">Advance only</SelectItem>
          <SelectItem value="FINAL">Due payment only</SelectItem>
        </SelectContent>
      </Select>

      {isError ? (
        <QueryErrorAlert message="Could not load pending payments." onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <ul className="space-y-3">
          {(data?.items ?? []).map((row) => (
            <li key={row.id}>
              <Card>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium">{row.lead.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {paymentKindLabel(row.kind)} · {formatMinorUnits(row.amountCents)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Marked by {row.markedBy.displayName ?? row.markedBy.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Badge variant="secondary">Pending</Badge>
                    <Button
                      type="button"
                      className="min-h-11"
                      onClick={() =>
                        setVerifyTarget({
                          leadId: row.leadId,
                          paymentId: row.id,
                          repId: row.lead.assignedToUserId
                        })
                      }
                    >
                      Review payment
                    </Button>
                    {row.lead.assignedToUserId ? (
                      <Button variant="outline" className="min-h-11" asChild>
                        <Link
                          to={`/portal/team/${row.lead.assignedToUserId}/projects/${row.leadId}?stage=${row.kind === "ADVANCE" ? "advance_verify" : "final_verify"}`}
                        >
                          Open project
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
          {(data?.items.length ?? 0) === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No pending payments.</p>
          ) : null}
        </ul>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
        </Button>
      </div>

      <PaymentVerifyDialog
        payment={payment}
        open={verifyTarget != null}
        onOpenChange={(o) => !o && setVerifyTarget(null)}
        isPending={verifyPay.isPending}
        clientName={leadQr.data?.lead.clientName}
        onVerify={(paymentId, body: VerifyPaymentRequestBody) =>
          verifyPay.mutate(
            { paymentId, body },
            {
              onSuccess: () => setVerifyTarget(null),
              onError: (e) => errToast(e, qc)
            }
          )
        }
      />
    </div>
  );
}
