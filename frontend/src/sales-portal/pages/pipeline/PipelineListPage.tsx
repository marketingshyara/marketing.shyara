import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Search } from "lucide-react";
import { useDebounced } from "../../hooks/useDebounced";
import { useLeadsQuery } from "../../hooks/useSalesQueries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { PortalPageHeader } from "../../components/PortalPageHeader";
import { SetProspectCategoryDialog } from "../../components/pipeline/SetProspectCategoryDialog";
import { DeleteLeadsDialog } from "../../components/pipeline/DeleteLeadsDialog";
import { ProspectCategoryBadge } from "../../components/pipeline/ProspectCategoryBadge";
import { PipelineListSummary } from "../../components/pipeline/PipelineListSummary";
import {
  PROSPECT_CATEGORIES,
  canChangeProspectCategory,
  canDeleteLead,
  prospectCategoryLabel,
  prospectCategoryShortLabel
} from "../../lib/leadProspectCategory";
import { listStatusChip } from "../../lib/pipelineCopy";
import type { ProspectCategory } from "../../types";
import { cn } from "@/lib/utils";

const VIEW_TABS = ["leads", "clients", "completed"] as const;
type ViewTab = (typeof VIEW_TABS)[number];

function isViewTab(v: string | null): v is ViewTab {
  return v === "leads" || v === "clients" || v === "completed";
}

function isProspectCategory(v: string | null): v is ProspectCategory {
  return PROSPECT_CATEGORIES.includes(v as ProspectCategory);
}

function tabLabel(v: ViewTab): string {
  if (v === "leads") return "Prospects";
  if (v === "clients") return "Active clients";
  return "Settled";
}

function emptyMessage(tab: ViewTab, category: ProspectCategory): string {
  if (tab !== "leads") {
    if (tab === "clients") return "No active clients yet.";
    return "No settled projects yet.";
  }
  return `No prospects in ${prospectCategoryLabel(category).toLowerCase()}.`;
}

export function PipelineListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlView = searchParams.get("view");
  const urlCategory = searchParams.get("prospectCategory");
  const initialTab = isViewTab(urlView) ? urlView : "leads";
  const initialCategory = isProspectCategory(urlCategory) ? urlCategory : "NEW_LEAD";
  const [tab, setTab] = useState<ViewTab>(initialTab);
  const [prospectCategory, setProspectCategory] = useState<ProspectCategory>(initialCategory);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [searchInput, setSearchInput] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const search = useDebounced(searchInput, 300);
  const searchTrimmed = search.trim();
  const searchTooShort = searchTrimmed.length > 0 && searchTrimmed.length < 2;

  useEffect(() => {
    setPage(1);
  }, [tab, prospectCategory, searchTrimmed]);

  useEffect(() => {
    setSelectedLeadIds(new Set());
  }, [tab, prospectCategory, page, searchTrimmed]);

  useEffect(() => {
    if (isViewTab(urlView)) setTab(urlView);
    if (isProspectCategory(urlCategory)) setProspectCategory(urlCategory);
  }, [urlView, urlCategory]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    const viewMatches = next.get("view") === tab;
    const categoryMatches =
      tab !== "leads"
        ? !next.has("prospectCategory")
        : next.get("prospectCategory") === prospectCategory;
    if (viewMatches && categoryMatches) return;

    next.set("view", tab);
    if (tab === "leads") {
      next.set("prospectCategory", prospectCategory);
    } else {
      next.delete("prospectCategory");
    }
    setSearchParams(next, { replace: true });
  }, [tab, prospectCategory, searchParams, setSearchParams]);

  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useLeadsQuery({
    page,
    pageSize,
    view: tab,
    prospectCategory: tab === "leads" ? prospectCategory : undefined,
    search: searchTooShort ? undefined : searchTrimmed || undefined,
    enabled: !searchTooShort
  });

  const countNewLead = useLeadsQuery({
    page: 1,
    pageSize: 1,
    view: "leads",
    prospectCategory: "NEW_LEAD",
    enabled: tab === "leads"
  });
  const countCallback = useLeadsQuery({
    page: 1,
    pageSize: 1,
    view: "leads",
    prospectCategory: "CALLBACK_REQUESTED",
    enabled: tab === "leads"
  });
  const countNoAnswer = useLeadsQuery({
    page: 1,
    pageSize: 1,
    view: "leads",
    prospectCategory: "NO_ANSWER",
    enabled: tab === "leads"
  });
  const countInterested = useLeadsQuery({
    page: 1,
    pageSize: 1,
    view: "leads",
    prospectCategory: "INTERESTED",
    enabled: tab === "leads"
  });
  const countFollowUp = useLeadsQuery({
    page: 1,
    pageSize: 1,
    view: "leads",
    prospectCategory: "FOLLOW_UP",
    enabled: tab === "leads"
  });
  const countNotInterested = useLeadsQuery({
    page: 1,
    pageSize: 1,
    view: "leads",
    prospectCategory: "NOT_INTERESTED",
    enabled: tab === "leads"
  });

  const categoryCounts: Record<ProspectCategory, number> = {
    NEW_LEAD: countNewLead.data?.total ?? 0,
    CALLBACK_REQUESTED: countCallback.data?.total ?? 0,
    NO_ANSWER: countNoAnswer.data?.total ?? 0,
    INTERESTED: countInterested.data?.total ?? 0,
    FOLLOW_UP: countFollowUp.data?.total ?? 0,
    NOT_INTERESTED: countNotInterested.data?.total ?? 0
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  const deletableOnPage = useMemo(
    () => (data?.items ?? []).filter((lead) => canDeleteLead(lead)),
    [data?.items]
  );
  const selectedIds = useMemo(
    () => [...selectedLeadIds].filter((id) => deletableOnPage.some((l) => l.id === id)),
    [selectedLeadIds, deletableOnPage]
  );
  const selectedNames = useMemo(
    () =>
      selectedIds
        .map((id) => data?.items.find((l) => l.id === id)?.clientName)
        .filter((n): n is string => Boolean(n)),
    [selectedIds, data?.items]
  );
  const allDeletableSelected =
    deletableOnPage.length > 0 && deletableOnPage.every((l) => selectedLeadIds.has(l.id));

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  const toggleAllDeletable = (checked: boolean) => {
    if (!checked) {
      setSelectedLeadIds(new Set());
      return;
    }
    setSelectedLeadIds(new Set(deletableOnPage.map((l) => l.id)));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PortalPageHeader
        title="Pipeline"
        variant="operational"
        toolbar={
          <DataStaleToolbar
            dataUpdatedAt={dataUpdatedAt}
            onRefresh={() => void refetch()}
            isFetching={isFetching}
          />
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div
          className="inline-flex flex-wrap rounded-lg border bg-muted/40 p-1"
          role="tablist"
          aria-label="Pipeline list"
        >
          {VIEW_TABS.map((v) => (
            <Button
              key={v}
              type="button"
              role="tab"
              aria-selected={tab === v}
              variant={tab === v ? "secondary" : "ghost"}
              className={cn("min-h-11", tab === v && "shadow-sm")}
              onClick={() => setTab(v)}
            >
              {tabLabel(v)}
            </Button>
          ))}
        </div>
        <Button asChild className="min-h-11">
          <Link to="/portal/pipeline/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Add prospect
          </Link>
        </Button>
      </div>

      {tab === "leads" ? (
        <div
          className="flex flex-wrap gap-1 rounded-lg border bg-muted/30 p-1"
          role="tablist"
          aria-label="Prospect categories"
        >
          {PROSPECT_CATEGORIES.map((category) => {
            const count = categoryCounts[category];
            return (
              <Button
                key={category}
                type="button"
                role="tab"
                aria-selected={prospectCategory === category}
                variant={prospectCategory === category ? "secondary" : "ghost"}
                className="min-h-11 gap-2 text-xs sm:text-sm"
                onClick={() => setProspectCategory(category)}
              >
                <span className="hidden sm:inline">{prospectCategoryLabel(category)}</span>
                <span className="sm:hidden">{prospectCategoryShortLabel(category)}</span>
                {count > 0 ? (
                  <Badge variant="secondary" className="tabular-nums">
                    {count > 99 ? "99+" : count}
                  </Badge>
                ) : null}
              </Button>
            );
          })}
        </div>
      ) : null}

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

      {tab === "leads" && deletableOnPage.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={allDeletableSelected}
              onCheckedChange={(c) => toggleAllDeletable(c === true)}
              aria-label="Select all deletable prospects on this page"
            />
            Select all on page
          </label>
          {selectedIds.length > 0 ? (
            <DeleteLeadsDialog
              leadIds={selectedIds}
              clientNames={selectedNames}
              variant="destructive"
              onDeleted={() => {
                setSelectedLeadIds(new Set());
                void refetch();
              }}
            />
          ) : (
            <p className="text-xs text-muted-foreground">Select prospects to delete</p>
          )}
        </div>
      ) : null}

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
        <div className="min-w-0 space-y-2">
          {data?.items.length === 0 ? (
            <div className="space-y-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {emptyMessage(tab, prospectCategory)}
              </p>
              {tab === "leads" ? (
                <Button className="min-h-11" asChild>
                  <Link to="/portal/pipeline/new">
                    <Plus className="mr-2 h-4 w-4" aria-hidden />
                    Add lead
                  </Link>
                </Button>
              ) : tab === "clients" ? (
                <Button variant="outline" className="min-h-11" onClick={() => setTab("leads")}>
                  View prospects
                </Button>
              ) : null}
            </div>
          ) : (
            data?.items.map((lead) => {
              const summary = lead.pipelineSummary ?? {
                currentStageKey: "lead_capture" as const,
                currentStageTitle: "Lead details",
                pendingAdmin: false
              };
              const statusChip = listStatusChip(summary, undefined, "rep");
              const categoryChangeable = tab === "leads" && canChangeProspectCategory(lead);
              const deletable = tab === "leads" && canDeleteLead(lead);
              const callbackHint =
                lead.prospectCategory === "CALLBACK_REQUESTED" && lead.callbackScheduledAt
                  ? format(new Date(lead.callbackScheduledAt), "d MMM, h:mm a")
                  : null;
              return (
                <div key={lead.id} className="space-y-2">
                  <ProspectCategoryBadge lead={lead} />
                  <div className="flex min-w-0 items-stretch gap-2">
                    {deletable ? (
                      <div className="flex shrink-0 items-center self-center px-0.5">
                        <Checkbox
                          checked={selectedLeadIds.has(lead.id)}
                          onCheckedChange={() => toggleLeadSelection(lead.id)}
                          aria-label={`Select ${lead.clientName}`}
                          className="size-[1.125rem]"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <PipelineListSummary
                        clientName={lead.clientName}
                        summary={summary}
                        agreedTotalCents={lead.agreedTotalCents}
                        href={`/portal/pipeline/${lead.id}`}
                        statusChip={statusChip}
                        detailLine={callbackHint ? <span>{callbackHint}</span> : undefined}
                        trailingAction={
                          deletable || categoryChangeable ? (
                            <div className="flex w-full flex-col gap-2 sm:w-auto">
                              {categoryChangeable ? (
                                <SetProspectCategoryDialog
                                  leadId={lead.id}
                                  clientName={lead.clientName}
                                  lead={lead}
                                  variant="listRow"
                                  triggerLabel="Set category"
                                  onUpdated={() => void refetch()}
                                />
                              ) : null}
                              {deletable ? (
                                <DeleteLeadsDialog
                                  leadIds={[lead.id]}
                                  clientNames={[lead.clientName]}
                                  variant="listRow"
                                  triggerLabel="Delete"
                                  onDeleted={() => void refetch()}
                                />
                              ) : null}
                            </div>
                          ) : null
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })
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
