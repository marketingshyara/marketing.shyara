import { Link } from "react-router-dom";
import { UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorAlert } from "../components/QueryErrorAlert";
import { DataStaleToolbar } from "../components/DataStaleToolbar";
import { useTeamRepsQuery } from "../hooks/useSalesQueries";

export function TeamHubPage() {
  const qr = useTeamRepsQuery(true);
  const loading = qr.isLoading;
  const fetching = qr.isFetching;

  if (qr.isError) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <QueryErrorAlert message="Could not load team." onRetry={() => void qr.refetch()} />
      </div>
    );
  }

  const items = qr.data?.items ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Team</h1>
          <p className="text-sm text-muted-foreground">Sales reps and quick pipeline signals.</p>
        </div>
        <DataStaleToolbar
          dataUpdatedAt={qr.dataUpdatedAt}
          onRefresh={() => void qr.refetch()}
          isFetching={fetching}
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <UserCircle className="h-10 w-10 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0">
                  <CardTitle className="text-base leading-tight">
                    {r.displayName ?? r.email}
                  </CardTitle>
                  <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Active leads:</span>{" "}
                  <span className="font-medium tabular-nums">{r.activeLeads}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Pending verifications:</span>{" "}
                  <span className="font-medium tabular-nums">{r.pendingVerifications}</span>
                </p>
                <Button asChild variant="outline" className="min-h-11 w-full">
                  <Link to={`/portal/team/${r.id}`}>Open rep overview</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
