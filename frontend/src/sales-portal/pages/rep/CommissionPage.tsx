import { useState } from "react";
import { ChevronLeft, ChevronRight, IndianRupee } from "lucide-react";
import { useCommissionsQuery } from "../../hooks/useSalesQueries";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { PortalPageHeader } from "../../components/PortalPageHeader";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { CommissionTimeline } from "../../components/ui/CommissionTimeline";
import { PortalEmptyState } from "../../components/ui/PortalEmptyState";
import { PortalStatusChip } from "../../components/ui/PortalStatusChip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMinorUnits } from "../../lib/money";

export function CommissionPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useCommissionsQuery({
    page,
    pageSize
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PortalPageHeader
        title="Commission"
        variant="operational"
        toolbar={
          <DataStaleToolbar
            dataUpdatedAt={dataUpdatedAt}
            onRefresh={() => void refetch()}
            isFetching={isFetching}
          />
        }
      />

      <CommissionTimeline />

      {isError ? (
        <QueryErrorAlert message="Could not load commission." onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (data?.items.length ?? 0) === 0 ? (
        <PortalEmptyState
          icon={IndianRupee}
          title="No commission yet"
          description="Appears after admin verifies your client's live site."
        />
      ) : (
        <ul className="space-y-3">
          {data!.items.map((row) => (
            <li key={row.id}>
              <Card>
                <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{row.lead.clientName}</p>
                    <p className="text-lg font-semibold mt-1">
                      {formatMinorUnits(row.amountCents)}
                      {row.bonusCents > 0
                        ? ` + ${formatMinorUnits(row.bonusCents)} bonus`
                        : ""}
                    </p>
                  </div>
                  <PortalStatusChip
                    kind={row.isPaid ? "complete" : "waiting"}
                    label={row.isPaid ? "Paid" : "Pending payout"}
                  />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {(data?.items.length ?? 0) > 0 ? (
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
      ) : null}
    </div>
  );
}
