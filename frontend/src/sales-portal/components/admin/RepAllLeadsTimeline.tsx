import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounced } from "../../hooks/useDebounced";
import { useTeamRepLeadsQuery } from "../../hooks/useSalesQueries";
import { QueryErrorAlert } from "../QueryErrorAlert";
import { PortalStatusChip, type PortalStatusChipKind } from "../ui/PortalStatusChip";
import { leadStatusLabel } from "../../lib/copy";
import type { RepLeadDisposition, TeamRepLeadItem } from "../../types";

type Props = {
  repId: string;
};

function dispositionLabel(d: RepLeadDisposition): string {
  if (d === "prospect") return "Prospect";
  if (d === "not_interested") return "Not interested";
  if (d === "client") return "Active client";
  return "Settled";
}

function dispositionChipKind(d: RepLeadDisposition): PortalStatusChipKind {
  if (d === "not_interested") return "waiting";
  if (d === "client") return "action";
  if (d === "settled") return "complete";
  return "idle";
}

function groupByCreatedDate(items: TeamRepLeadItem[]): { dateKey: string; label: string; items: TeamRepLeadItem[] }[] {
  const map = new Map<string, TeamRepLeadItem[]>();
  for (const item of items) {
    const d = new Date(item.createdAt);
    const dateKey = format(d, "yyyy-MM-dd");
    const bucket = map.get(dateKey) ?? [];
    bucket.push(item);
    map.set(dateKey, bucket);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, groupItems]) => ({
      dateKey,
      label: format(new Date(dateKey), "EEEE, d MMM yyyy"),
      items: groupItems
    }));
}

export function RepAllLeadsTimeline({ repId }: Props) {
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput, 300);
  const searchTrimmed = search.trim();
  const searchTooShort = searchTrimmed.length > 0 && searchTrimmed.length < 2;

  const qr = useTeamRepLeadsQuery(repId, {
    page,
    pageSize,
    search: searchTooShort ? undefined : searchTrimmed || undefined,
    enabled: !searchTooShort
  });

  const groups = useMemo(() => groupByCreatedDate(qr.data?.items ?? []), [qr.data?.items]);
  const totalPages = qr.data ? Math.max(1, Math.ceil(qr.data.total / pageSize)) : 1;

  if (qr.isError) {
    return (
      <QueryErrorAlert message="Could not load leads for this rep." onRetry={() => void qr.refetch()} />
    );
  }

  if (qr.isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rep-leads-search">Search leads</Label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="rep-leads-search"
            className="min-h-11 pl-9"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Name, phone, or email (min 2 characters)"
          />
        </div>
        {searchTooShort ? (
          <p className="text-xs text-muted-foreground">Type at least 2 characters to search.</p>
        ) : null}
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">No leads match this filter.</p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.dateKey} className="space-y-2">
              <h3 className="sticky top-0 z-10 border-b bg-background/95 py-2 text-sm font-semibold backdrop-blur">
                {group.label}
              </h3>
              <ul className="space-y-2">
                {group.items.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      to={`/portal/team/${repId}/projects/${lead.id}`}
                      className="flex min-h-11 flex-col gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium">{lead.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {format(new Date(lead.createdAt), "h:mm a")}
                          {lead.notInterestedNote ? ` · ${lead.notInterestedNote}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <PortalStatusChip
                          kind={dispositionChipKind(lead.disposition)}
                          label={dispositionLabel(lead.disposition)}
                        />
                        <PortalStatusChip kind="idle" label={leadStatusLabel(lead.status)} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {qr.data && qr.data.total > pageSize ? (
        <p className="text-xs text-muted-foreground">
          Date headings apply within each page. Use search or browse pages to see older leads.
        </p>
      ) : null}

      {qr.data && qr.data.total > pageSize ? (
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
