import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeadsQuery } from "../../hooks/useSalesQueries";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { PortalPageHeader } from "../../components/PortalPageHeader";
import { RestoreLeadButton } from "../../components/pipeline/RestoreLeadButton";

export function NotInterestedLeadsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useLeadsQuery({
    page,
    pageSize,
    view: "not_interested"
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Button asChild variant="ghost" className="min-h-11 -ml-2 w-fit px-2">
        <Link to="/portal/pipeline">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Back to pipeline
        </Link>
      </Button>

      <PortalPageHeader
        title="Not interested"
        variant="operational"
        stat={data ? `${data.total} archived` : undefined}
        toolbar={
          <DataStaleToolbar
            dataUpdatedAt={dataUpdatedAt}
            onRefresh={() => void refetch()}
            isFetching={isFetching}
          />
        }
      />

      <p className="text-sm text-muted-foreground">
        Prospects you marked not interested. Restore any to return them to your active Prospects
        list.
      </p>

      {isError ? (
        <QueryErrorAlert message="Could not load not interested prospects." onRetry={() => void refetch()} />
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No not interested prospects yet.
        </p>
      ) : (
        <div className="space-y-3">
          {data?.items.map((lead) => (
            <div
              key={lead.id}
              className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-medium">{lead.clientName}</p>
                {lead.notInterestedAt ? (
                  <p className="text-xs text-muted-foreground">
                    Marked{" "}
                    {format(new Date(lead.notInterestedAt), "d MMM yyyy, h:mm a")}
                  </p>
                ) : null}
                {lead.notInterestedNote ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">{lead.notInterestedNote}</p>
                ) : null}
              </div>
              <RestoreLeadButton
                leadId={lead.id}
                clientName={lead.clientName}
                onRestored={() => void refetch()}
              />
            </div>
          ))}
        </div>
      )}

      {data && data.total > pageSize ? (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            className="min-h-11"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            className="min-h-11"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
