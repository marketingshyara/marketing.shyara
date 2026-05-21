import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  errToast,
  useLeadQuery,
  usePendingActionsQuery,
  useTeamRepsQuery,
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
import type { PendingActionItem, PendingActionType } from "../../types";
import type { VerifyPaymentRequestBody } from "../../api/salesApi";

const ACTION_TYPES: (PendingActionType | "all")[] = [
  "all",
  "PAYMENT",
  "WHATSAPP",
  "DEMO_FINALIZED",
  "ACCOUNTS",
  "BUILD_DEMO",
  "REPO_TRANSFER",
  "DEPLOYMENT",
  "COMMISSION"
];

function actionTypeLabel(t: PendingActionType): string {
  const map: Record<PendingActionType, string> = {
    PAYMENT: "Payment",
    WHATSAPP: "WhatsApp",
    DEMO_FINALIZED: "Demo approval",
    ACCOUNTS: "Accounts",
    BUILD_DEMO: "Build demo",
    REPO_TRANSFER: "Repo transfer",
    DEPLOYMENT: "Deployment",
    COMMISSION: "Commission"
  };
  return map[t];
}

export function ReviewsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [actionType, setActionType] = useState<PendingActionType | "all">("all");
  const [paymentVerify, setPaymentVerify] = useState<{
    leadId: string;
    paymentId: string;
    repId: string | null;
  } | null>(null);

  const repsQr = useTeamRepsQuery(true);

  useEffect(() => {
    setPage(1);
  }, [actionType]);

  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = usePendingActionsQuery({
    page,
    pageSize,
    type: actionType === "all" ? undefined : actionType
  });

  const leadQr = useLeadQuery(paymentVerify?.leadId, !!paymentVerify?.leadId);
  const payment =
    paymentVerify && leadQr.data?.lead.payments
      ? leadQr.data.lead.payments.find((p) => p.id === paymentVerify.paymentId) ?? null
      : null;

  const verifyPay = useVerifyPaymentMutation(
    paymentVerify?.leadId ?? "",
    paymentVerify?.repId
  );

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PortalPageHeader
        title="Reviews"
        description="All items waiting for your approval — payments, stages, and payouts. Use Payments for advance and due payments only."
        toolbar={
          <DataStaleToolbar
            dataUpdatedAt={dataUpdatedAt}
            onRefresh={() => refetch()}
            isFetching={isFetching}
          />
        }
      />

      <Select
        value={actionType}
        onValueChange={(v) => setActionType(v as PendingActionType | "all")}
      >
        <SelectTrigger className="min-h-11 w-full sm:w-[240px]" aria-label="Action type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {ACTION_TYPES.filter((t) => t !== "all").map((t) => (
            <SelectItem key={t} value={t}>
              {actionTypeLabel(t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isError ? (
        <QueryErrorAlert message="Could not load verification queue." onRetry={() => void refetch()} />
      ) : null}

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : data?.items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No pending actions. You are caught up.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.items.map((item) => (
            <PendingActionRow
              key={`${item.type}-${item.leadId}-${item.stageKey}-${item.paymentId ?? ""}`}
              item={item}
              reps={repsQr.data?.items ?? []}
              onReviewPayment={() =>
                item.paymentId &&
                setPaymentVerify({
                  leadId: item.leadId,
                  paymentId: item.paymentId,
                  repId: item.repId
                })
              }
            />
          ))}
        </div>
      )}

      {data && data.total > pageSize ? (
        <nav className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            className="min-h-11"
            disabled={page <= 1}
            onClick={() => setPage((x) => x - 1)}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            className="min-h-11"
            disabled={page >= totalPages}
            onClick={() => setPage((x) => x + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </nav>
      ) : null}

      <PaymentVerifyDialog
        payment={payment}
        open={paymentVerify != null && payment != null}
        onOpenChange={(o) => !o && setPaymentVerify(null)}
        isPending={verifyPay.isPending}
        clientName={leadQr.data?.lead.clientName}
        templateLabel={null}
        agreedTotalCents={leadQr.data?.lead.agreedTotalCents}
        onVerify={(paymentId, body: VerifyPaymentRequestBody) =>
          verifyPay.mutate(
            { paymentId, body },
            {
              onSuccess: () => setPaymentVerify(null),
              onError: (e) => errToast(e, qc)
            }
          )
        }
      />
    </div>
  );
}

function PendingActionRow({
  item,
  reps,
  onReviewPayment
}: {
  item: PendingActionItem;
  reps: { id: string; displayName: string | null; email: string }[];
  onReviewPayment: () => void;
}) {
  const repLabel =
    reps.find((r) => r.id === item.repId)?.displayName ??
    reps.find((r) => r.id === item.repId)?.email ??
    item.repId ??
    "—";

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">{item.clientName}</p>
          <p className="text-sm text-muted-foreground">
            <Badge variant="outline" className="mr-2">
              {actionTypeLabel(item.type)}
            </Badge>
            {item.summary}
          </p>
          <p className="text-xs text-muted-foreground">Rep: {repLabel}</p>
        </div>
        {item.type === "PAYMENT" ? (
          <Button className="min-h-11" onClick={onReviewPayment}>
            Review payment
          </Button>
        ) : (
          <Button className="min-h-11" asChild>
            <Link
              to={
                item.repId
                  ? `/portal/team/${item.repId}/projects/${item.leadId}?stage=${item.stageKey}`
                  : "/portal/team"
              }
            >
              Open project
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
