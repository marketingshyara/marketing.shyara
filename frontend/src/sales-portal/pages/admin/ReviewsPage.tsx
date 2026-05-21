import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounced } from "../../hooks/useDebounced";
import { usePendingPaymentsQuery, useVerifyPaymentMutation } from "../../hooks/useSalesQueries";
import { formatMinorUnits } from "../../lib/money";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { PaymentVerifyDialog } from "../../components/pipeline/PaymentVerifyDialog";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeadPaymentWithRelations, PaymentKind } from "../../types";
import type { VerifyPaymentRequestBody } from "../../api/salesApi";

const KINDS: (PaymentKind | "all")[] = ["all", "ADVANCE", "FINAL"];

export function ReviewsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [kind, setKind] = useState<PaymentKind | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [verifyRow, setVerifyRow] = useState<LeadPaymentWithRelations | null>(null);
  const search = useDebounced(searchInput, 300);
  const searchTrimmed = search.trim();
  const searchTooShort = searchTrimmed.length > 0 && searchTrimmed.length < 2;

  useEffect(() => {
    setPage(1);
  }, [kind, searchTrimmed]);

  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = usePendingPaymentsQuery({
    page,
    pageSize,
    kind: kind === "all" ? undefined : kind,
    search: searchTooShort ? undefined : searchTrimmed || undefined,
    enabled: !searchTooShort
  });

  const verifyPay = useVerifyPaymentMutation(verifyRow?.lead.id ?? "");

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Reviews</h1>
          <p className="text-sm text-muted-foreground">
            Verify advance and due payments. Open the client project for other verification steps.
          </p>
        </div>
        <DataStaleToolbar
          dataUpdatedAt={dataUpdatedAt}
          onRefresh={() => refetch()}
          isFetching={isFetching}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="min-w-0 flex-1 space-y-1">
          <Input
            placeholder="Search client name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="min-h-11 w-full"
            aria-label="Search by client name"
          />
          {searchTooShort ? (
            <p className="text-xs text-muted-foreground">Type at least 2 characters to search.</p>
          ) : null}
        </div>
        <Select value={kind} onValueChange={(v) => setKind(v as PaymentKind | "all")}>
          <SelectTrigger className="min-h-11 w-full sm:w-[200px]" aria-label="Payment kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All kinds</SelectItem>
            <SelectItem value="ADVANCE">Advance</SelectItem>
            <SelectItem value="FINAL">Due</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <QueryErrorAlert message="Could not load pending payments." onRetry={() => void refetch()} />
      ) : null}

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : data?.items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No pending payments.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.items.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link
                    to={
                      p.lead.assignedToUserId
                        ? `/portal/team/${p.lead.assignedToUserId}/projects/${p.lead.id}`
                        : `/portal/reviews`
                    }
                    className="font-medium text-primary"
                  >
                    {p.lead.clientName}
                  </Link>
                  <p className="text-sm tabular-nums">
                    <Badge variant="outline" className="mr-2">
                      {p.kind === "ADVANCE" ? "Advance" : "Due"}
                    </Badge>
                    {formatMinorUnits(p.amountCents)}
                  </p>
                </div>
                <Button className="min-h-11" onClick={() => setVerifyRow(p)}>
                  Review payment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.total > pageSize ? (
        <nav className="flex items-center justify-center gap-2">
          <Button variant="outline" className="min-h-11" disabled={page <= 1} onClick={() => setPage((x) => x - 1)}>
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
        payment={verifyRow}
        open={verifyRow != null}
        onOpenChange={(o) => !o && setVerifyRow(null)}
        isPending={verifyPay.isPending}
        onVerify={(paymentId, body: VerifyPaymentRequestBody) =>
          verifyPay.mutate({ paymentId, body }, { onSuccess: () => setVerifyRow(null) })
        }
      />
    </div>
  );
}
