import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCommissionsQuery } from "../../hooks/useSalesQueries";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { PortalPageHeader } from "../../components/PortalPageHeader";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMinorUnits } from "../../lib/money";
import { leadStatusLabel } from "../../lib/copy";

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
        title="Your commission"
        description="Commission is calculated after admin verifies the client site is live. Payout is marked paid within 3–5 business days after that step."
        toolbar={
          <DataStaleToolbar
            dataUpdatedAt={dataUpdatedAt}
            onRefresh={() => void refetch()}
            isFetching={isFetching}
          />
        }
      />

      {isError ? (
        <QueryErrorAlert message="Could not load commission." onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (data?.items.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No commission yet. It appears after admin verifies deployment on a completed deal.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {data!.items.map((row) => (
            <li key={row.id}>
              <Card>
                <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{row.lead.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      Project status: {leadStatusLabel(row.lead.status)}
                    </p>
                    <p className="text-lg font-semibold mt-1">
                      {formatMinorUnits(row.amountCents)}
                      {row.bonusCents > 0
                        ? ` + ${formatMinorUnits(row.bonusCents)} bonus`
                        : ""}
                    </p>
                  </div>
                  <Badge variant={row.isPaid ? "default" : "secondary"}>
                    {row.isPaid ? "Paid" : "Pending payout"}
                  </Badge>
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
