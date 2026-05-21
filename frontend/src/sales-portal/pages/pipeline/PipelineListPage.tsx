import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useDebounced } from "../../hooks/useDebounced";
import { useLeadsQuery } from "../../hooks/useSalesQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { leadStatusLabel } from "../../lib/copy";
import { formatMinorUnits } from "../../lib/money";
import { cn } from "@/lib/utils";

type ViewTab = "leads" | "clients";

export function PipelineListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("view") as ViewTab | null) ?? "leads";
  const [tab, setTab] = useState<ViewTab>(initialTab);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput, 300);
  const searchTrimmed = search.trim();
  const searchTooShort = searchTrimmed.length > 0 && searchTrimmed.length < 2;

  useEffect(() => {
    setPage(1);
  }, [tab, searchTrimmed]);

  useEffect(() => {
    const urlView = searchParams.get("view");
    if (urlView === "leads" || urlView === "clients") {
      setTab(urlView);
    }
  }, [searchParams]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("view", tab);
    setSearchParams(next, { replace: true });
  }, [tab, searchParams, setSearchParams]);

  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useLeadsQuery({
    page,
    pageSize,
    view: tab,
    search: searchTooShort ? undefined : searchTrimmed || undefined,
    enabled: !searchTooShort
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Pipeline</h1>
          <p className="text-sm text-muted-foreground">Your leads and clients</p>
        </div>
        <DataStaleToolbar
          dataUpdatedAt={dataUpdatedAt}
          onRefresh={() => void refetch()}
          isFetching={isFetching}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className="inline-flex rounded-lg border bg-muted/40 p-1"
          role="tablist"
          aria-label="Leads or clients"
        >
          {(["leads", "clients"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              role="tab"
              aria-selected={tab === v}
              variant={tab === v ? "secondary" : "ghost"}
              className={cn("min-h-11 capitalize", tab === v && "shadow-sm")}
              onClick={() => setTab(v)}
            >
              {v === "leads" ? "Leads" : "Clients"}
            </Button>
          ))}
        </div>
        <Button asChild className="min-h-11">
          <Link to="/portal/pipeline/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Add lead
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pipeline-search">Search</Label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="pipeline-search"
            className="min-h-11 pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Name, phone, or email (min 2 characters)"
          />
        </div>
        {searchTooShort ? (
          <p className="text-xs text-muted-foreground">Type at least 2 characters to search.</p>
        ) : null}
      </div>

      {isError ? (
        <QueryErrorAlert message="Could not load pipeline." onRetry={() => void refetch()} />
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {tab === "leads" ? "No leads yet. Add your first lead." : "No clients yet."}
            </p>
          ) : (
            data?.items.map((lead) => (
              <Card key={lead.id}>
                <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      to={`/portal/pipeline/${lead.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {lead.clientName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {leadStatusLabel(lead.status)}
                      {lead.agreedTotalCents
                        ? ` · ${formatMinorUnits(lead.agreedTotalCents)}`
                        : ""}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="min-h-11 shrink-0">
                    <Link to={`/portal/pipeline/${lead.id}`}>Open</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
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
