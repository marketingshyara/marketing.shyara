import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTeamRepQuery } from "../../hooks/useSalesQueries";
import { AdminProjectCard } from "../../components/admin/AdminProjectCard";
import { RepAllLeadsTimeline } from "../../components/admin/RepAllLeadsTimeline";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { PortalPageHeader } from "../../components/PortalPageHeader";

type PageTab = "projects" | "all_leads";
type FilterTab = "active" | "all" | "completed";

export function RepProjectsPage() {
  const { repId } = useParams<{ repId: string }>();
  const [pageTab, setPageTab] = useState<PageTab>("projects");
  const [projectTab, setProjectTab] = useState<FilterTab>("active");
  const qr = useTeamRepQuery(repId, !!repId, projectTab);

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
      <Button asChild variant="ghost" className="min-h-11 -ml-2 w-fit px-2">
        <Link to="/portal/team">← Sales team</Link>
      </Button>
      <PortalPageHeader
        title={rep.displayName ?? rep.email}
        variant="operational"
        stat={pageTab === "projects" ? `${projects.length} projects` : "All leads"}
        toolbar={
          <DataStaleToolbar
            dataUpdatedAt={qr.dataUpdatedAt}
            onRefresh={() => void qr.refetch()}
            isFetching={qr.isFetching}
          />
        }
      />

      {rep.archivedAt ? (
        <p className="border-2 border-[#0A0A0A] bg-[#FAFAFA] px-3 py-2 text-sm text-[#0A0A0A]">
          This rep was removed from the active team. Their converted clients remain here and on{" "}
          <Link to="/portal/projects" className="font-medium underline">
            All clients
          </Link>
          .
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 text-xs">
        <StatPill label="Active prospects" value={rep.totalLeads} />
        {(rep.notInterestedLeads ?? 0) > 0 ? (
          <StatPill label="Not interested" value={rep.notInterestedLeads ?? 0} />
        ) : null}
        <StatPill label="Clients" value={rep.activeClients} />
        <StatPill label="Ongoing" value={rep.ongoingProjects} />
        <StatPill label="Completed" value={rep.completedProjects ?? 0} />
        <StatPill label="Pending payments" value={rep.pendingPayments} />
        <StatPill
          label="Needs your approval"
          value={rep.needsAdminAction}
          alert={rep.needsAdminAction > 0}
        />
      </div>

      <div
        className="inline-flex rounded-lg border bg-muted/40 p-1"
        role="tablist"
        aria-label="Rep detail"
      >
        {(
          [
            ["projects", "Projects"],
            ["all_leads", "All leads"]
          ] as const
        ).map(([v, label]) => (
          <Button
            key={v}
            type="button"
            role="tab"
            aria-selected={pageTab === v}
            variant={pageTab === v ? "secondary" : "ghost"}
            className={cn("min-h-11", pageTab === v && "shadow-sm")}
            onClick={() => setPageTab(v)}
          >
            {label}
          </Button>
        ))}
      </div>

      {pageTab === "all_leads" ? (
        <RepAllLeadsTimeline repId={repId} />
      ) : (
        <>
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
                aria-selected={projectTab === v}
                variant={projectTab === v ? "secondary" : "ghost"}
                className={cn("min-h-11 capitalize", projectTab === v && "shadow-sm")}
                onClick={() => setProjectTab(v)}
              >
                {v === "active" ? "Active" : v === "completed" ? "Completed" : "All"}
              </Button>
            ))}
          </div>

          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {projectTab === "active"
                ? "No active client projects for this rep."
                : "No projects in this filter."}
            </p>
          ) : (
            <div className="space-y-3">
              {[...projects]
                .sort((a, b) => {
                  if (a.pendingAdmin === b.pendingAdmin) return 0;
                  return a.pendingAdmin ? -1 : 1;
                })
                .map((p) => (
                  <AdminProjectCard key={p.id} repId={repId} project={p} />
                ))}
            </div>
          )}
        </>
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
