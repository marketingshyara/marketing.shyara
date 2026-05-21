import { useTeamRepsQuery } from "../../hooks/useSalesQueries";
import { AdminRepCard } from "../../components/admin/AdminRepCard";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { Skeleton } from "@/components/ui/skeleton";

export function TeamHubPage() {
  const qr = useTeamRepsQuery(true);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Sales team</h1>
          <p className="text-sm text-muted-foreground">
            Manage reps, verify payments, and track each client project.
          </p>
        </div>
        <DataStaleToolbar
          dataUpdatedAt={qr.dataUpdatedAt}
          onRefresh={() => void qr.refetch()}
          isFetching={qr.isFetching}
        />
      </div>

      {qr.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active sales reps yet. Add reps under Users.</p>
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
