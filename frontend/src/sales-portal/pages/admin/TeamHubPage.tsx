import { usePendingActionsCountQuery, useTeamRepsQuery } from "../../hooks/useSalesQueries";
import { AdminRepCard } from "../../components/admin/AdminRepCard";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { PortalPageHeader } from "../../components/PortalPageHeader";
import { PortalActionBanner } from "../../components/ui/PortalActionBanner";
import { PortalEmptyState } from "../../components/ui/PortalEmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { UsersRound } from "lucide-react";

export function TeamHubPage() {
  const qr = useTeamRepsQuery(true);
  const pendingCount = usePendingActionsCountQuery(true);
  const pendingTotal = pendingCount.data?.total ?? 0;

  if (qr.isError) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <QueryErrorAlert message="Could not load sales team." onRetry={() => void qr.refetch()} />
      </div>
    );
  }

  const items = qr.data?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PortalPageHeader
        title="Sales team"
        variant="operational"
        toolbar={
          <DataStaleToolbar
            dataUpdatedAt={qr.dataUpdatedAt}
            onRefresh={() => void qr.refetch()}
            isFetching={qr.isFetching}
          />
        }
      />

      {pendingTotal > 0 ? (
        <PortalActionBanner
          variant="urgent"
          message={`${pendingTotal} item${pendingTotal === 1 ? "" : "s"} need your approval`}
          actionLabel="Open reviews"
          actionTo="/portal/reviews"
        />
      ) : null}

      {qr.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <PortalEmptyState
          icon={UsersRound}
          title="No sales reps yet"
          description="Add reps under Users to get started."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((rep) => (
            <AdminRepCard key={rep.id} rep={rep} />
          ))}
        </div>
      )}
    </div>
  );
}
