import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTeamRepQuery } from "../../hooks/useSalesQueries";
import { AdminProjectCard } from "../../components/admin/AdminProjectCard";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";

type FilterTab = "active" | "all" | "completed";

export function RepProjectsPage() {
  const { repId } = useParams<{ repId: string }>();
  const [tab, setTab] = useState<FilterTab>("active");
  const qr = useTeamRepQuery(repId, !!repId, tab);

  if (!repId) {
    return <p className="text-destructive">Missing rep.</p>;
  }

  if (qr.isError) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <QueryErrorAlert message="Could not load this rep." onRetry={() => void qr.refetch()} />
        <Button asChild variant="link" className="min-h-11">
          <Link to="/portal/team">Back to team</Link>
        </Button>
      </div>
    );
  }

  if (qr.isLoading || !qr.data) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const { rep, projects } = qr.data;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button asChild variant="ghost" className="min-h-11 -ml-2 w-fit px-2">
            <Link to="/portal/team">← Sales team</Link>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {rep.displayName ?? rep.email}
          </h1>
          <p className="text-sm text-muted-foreground">{rep.email}</p>
        </div>
        <DataStaleToolbar
          dataUpdatedAt={qr.dataUpdatedAt}
          onRefresh={() => void qr.refetch()}
          isFetching={qr.isFetching}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <StatPill label="Leads" value={rep.totalLeads} />
        <StatPill label="Clients" value={rep.activeClients} />
        <StatPill label="Ongoing" value={rep.ongoingProjects} />
        <StatPill label="Pending payments" value={rep.pendingPayments} />
        <StatPill label="Needs action" value={rep.needsAdminAction} alert={rep.needsAdminAction > 0} />
      </div>

      <div
        className="inline-flex rounded-lg border bg-muted/40 p-1"
        role="tablist"
        aria-label="Project filter"
      >
        {(["active", "all", "completed"] as const).map((v) => (
          <Button
            key={v}
            type="button"
            role="tab"
            aria-selected={tab === v}
            variant={tab === v ? "secondary" : "ghost"}
            className={cn("min-h-11 capitalize", tab === v && "shadow-sm")}
            onClick={() => setTab(v)}
          >
            {v === "active" ? "Active" : v === "completed" ? "Completed" : "All"}
          </Button>
        ))}
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {tab === "active"
            ? "No active client projects for this rep."
            : "No projects in this filter."}
        </p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <AdminProjectCard key={p.id} repId={repId} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatPill({
  label,
  value,
  alert
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <span
      className={
        alert
          ? "rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 font-medium tabular-nums"
          : "rounded-md border bg-muted/50 px-2 py-1 tabular-nums text-muted-foreground"
      }
    >
      {label}: {value}
    </span>
  );
}
