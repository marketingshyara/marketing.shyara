import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAdminProjectsQuery } from "../../hooks/useSalesQueries";
import { PipelineListSummary } from "../../components/pipeline/PipelineListSummary";
import { listStatusChip } from "../../lib/pipelineCopy";
import type { LeadPipelineSummary } from "../../types";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { PortalPageHeader } from "../../components/PortalPageHeader";
type FilterTab = "all" | "active" | "completed";

export function AllProjectsPage() {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<FilterTab>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState<string | undefined>();
  const pageSize = 20;

  const qr = useAdminProjectsQuery({
    page,
    pageSize,
    status: tab,
    search,
    enabled: true
  });

  const totalPages = qr.data ? Math.max(1, Math.ceil(qr.data.total / pageSize)) : 1;

  useEffect(() => {
    if (qr.data == null) return;
    const tp = Math.max(1, Math.ceil(qr.data.total / pageSize));
    setPage((p) => Math.min(p, tp));
  }, [qr.data, pageSize]);

  const runSearch = () => {
    const q = searchInput.trim();
    setSearch(q.length >= 2 ? q : undefined);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PortalPageHeader
        title="All clients"
        variant="operational"
        description="Permanent record of converted clients—projects are not deleted from here."
        toolbar={
          !qr.isLoading && (
            <DataStaleToolbar
              dataUpdatedAt={qr.dataUpdatedAt}
              onRefresh={() => void qr.refetch()}
              isFetching={qr.isFetching}
            />
          )
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          className="min-h-11 flex-1"
          placeholder="Search client name (2+ characters)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch();
          }}
        />
        <Button type="button" variant="secondary" className="min-h-11" onClick={runSearch}>
          Search
        </Button>
      </div>

      <div
        className="inline-flex rounded-lg border bg-muted/40 p-1"
        role="tablist"
        aria-label="Client filter"
      >
        {(["all", "active", "completed"] as const).map((v) => (
          <Button
            key={v}
            type="button"
            role="tab"
            aria-selected={tab === v}
            variant={tab === v ? "secondary" : "ghost"}
            className={cn("min-h-11 capitalize", tab === v && "shadow-sm")}
            onClick={() => {
              setTab(v);
              setPage(1);
            }}
          >
            {v === "all" ? "All" : v === "active" ? "Active" : "Completed"}
          </Button>
        ))}
      </div>

      {qr.isError && (
        <QueryErrorAlert message="Could not load clients." onRetry={() => void qr.refetch()} />
      )}

      {qr.isLoading && <Skeleton className="h-48 w-full" />}

      {!qr.isLoading && qr.data?.items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {search ? "No clients match your search." : "No converted clients yet."}
        </p>
      )}

      <div className="space-y-3">
        {qr.data?.items.map((project) => {
          const summary: LeadPipelineSummary = {
            currentStageKey: project.currentStageKey as LeadPipelineSummary["currentStageKey"],
            currentStageTitle: project.currentStageTitle,
            pendingAdmin: project.pendingAdmin
          };
          const repName =
            project.rep?.displayName?.trim() || project.rep?.email || "Unassigned";
          const repSuffix = project.rep?.archivedAt ? " (removed)" : "";
          const statusChip = listStatusChip(summary, undefined, "admin");
          return (
            <PipelineListSummary
              key={project.id}
              clientName={project.clientName}
              summary={summary}
              agreedTotalCents={project.agreedTotalCents}
              href={`/portal/team/${project.assignedToUserId}/projects/${project.id}`}
              statusChip={statusChip}
              detailLine={
                <>
                  Rep: {repName}
                  {repSuffix}
                </>
              }
            />
          );
        })}
      </div>

      {qr.data && totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center justify-center gap-2"
          aria-label="All clients pagination"
        >
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="min-h-11"
          >
            Previous
          </Button>
          <span className="w-full basis-full px-2 text-center text-sm text-muted-foreground sm:w-auto sm:basis-auto">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="min-h-11"
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
