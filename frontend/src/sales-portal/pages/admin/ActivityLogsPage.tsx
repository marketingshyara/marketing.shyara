import { useState } from "react";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { useActivityLogsQuery, useSessionQuery } from "../../hooks/useSalesQueries";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { PortalPageHeader } from "../../components/PortalPageHeader";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { activityActionLabel } from "../../lib/copy";

export function ActivityLogsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const sessionQr = useSessionQuery();
  const isAdmin = sessionQr.data?.user?.role === "ADMIN";
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useActivityLogsQuery({
    page,
    pageSize,
    enabled: isAdmin
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;
  const items = data?.items ?? [];
  const showEmpty = !isLoading && !isError && items.length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PortalPageHeader
        title="Activity log"
        description="Audit trail of logins, payments, and project changes across the portal."
        toolbar={
          <DataStaleToolbar
            dataUpdatedAt={dataUpdatedAt}
            onRefresh={() => void refetch()}
            isFetching={isFetching}
          />
        }
      />

      {isError ? (
        <QueryErrorAlert message="Could not load activity logs." onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : showEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <History className="h-10 w-10 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground">No activity yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Logins, payment verifications, and project updates will appear here as your team uses
              the portal.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">Portal activity audit log</caption>
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th scope="col" className="px-4 py-3 font-medium">
                      When
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Action
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Entity
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      User
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{activityActionLabel(row.action)}</td>
                      <td className="px-4 py-3">
                        {row.entityType} · <span className="font-mono text-xs">{row.entityId}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {row.user?.displayName ?? row.user?.email ?? row.userId ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (data?.total ?? 0) > 0 ? (
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
