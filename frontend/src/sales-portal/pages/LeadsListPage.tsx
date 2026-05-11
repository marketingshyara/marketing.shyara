import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useLeadsQuery, useSessionQuery, useUsersQuery } from "../hooks/useSalesQueries";
import type { LeadStatus } from "../types";
import { DataStaleToolbar } from "../components/DataStaleToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatMinorUnits } from "../lib/money";
import { QueryErrorAlert } from "../components/QueryErrorAlert";
import { useDebounced } from "../hooks/useDebounced";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { leadStatusLabel } from "../lib/copy";

const STATUSES: LeadStatus[] = [
  "NEW",
  "ADVANCE_PAID",
  "BUILDING",
  "PREVIEW_SENT",
  "FINAL_PAID",
  "DEPLOYED",
  "COMMISSION_PAID"
];

function parseDateStartLocal(s: string): Date | undefined {
  if (!s.trim()) return undefined;
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseDateEndLocal(s: string): Date | undefined {
  if (!s.trim()) return undefined;
  const d = new Date(`${s}T23:59:59.999`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function LeadsListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(() => Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = 20;
  const [status, setStatus] = useState<LeadStatus | "all">(
    (searchParams.get("status") as LeadStatus | "all" | null) ?? "all"
  );
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [assigneeId, setAssigneeId] = useState(() => searchParams.get("rep") ?? "");
  const search = useDebounced(searchInput, 300);
  const searchTrimmed = search.trim();
  const searchTooShort = searchTrimmed.length > 0 && searchTrimmed.length < 2;

  const { data: session } = useSessionQuery();
  const isAdmin = session?.user?.role === "ADMIN";
  const { data: usersData } = useUsersQuery(1, 200, isAdmin);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (page > 1) next.set("page", String(page));
    else next.delete("page");
    if (status !== "all") next.set("status", status);
    else next.delete("status");
    if (searchTrimmed.length >= 2) next.set("search", searchTrimmed);
    else next.delete("search");
    if (isAdmin && assigneeId) next.set("rep", assigneeId);
    else next.delete("rep");
    setSearchParams(next, { replace: true });
  }, [assigneeId, isAdmin, page, searchParams, searchTrimmed, setSearchParams, status]);

  const fromD = parseDateStartLocal(fromInput);
  const toD = parseDateEndLocal(toInput);
  const rangeInvalid = fromD != null && toD != null && fromD.getTime() > toD.getTime();

  useEffect(() => {
    const st = location.state as { adminForbidden?: boolean } | null;
    if (st?.adminForbidden) {
      toast.message("That page is for admins only.");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useLeadsQuery({
    page,
    pageSize,
    status: status === "all" ? undefined : status,
    search: searchTooShort ? undefined : searchTrimmed || undefined,
    from: rangeInvalid ? undefined : fromD,
    to: rangeInvalid ? undefined : toD,
    assignedToUserId: isAdmin && assigneeId ? assigneeId : undefined,
    enabled: !rangeInvalid && !searchTooShort
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  useEffect(() => {
    if (data == null) return;
    const tp = Math.max(1, Math.ceil(data.total / pageSize));
    setPage((p) => Math.min(p, tp));
  }, [data, pageSize]);

  const repChoices = usersData?.items.filter((u) => u.role === "SALES_REP" && u.isActive) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Leads</h1>
          <p className="text-sm text-muted-foreground">Search and manage pipeline leads.</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <DataStaleToolbar
            dataUpdatedAt={dataUpdatedAt}
            onRefresh={() => void refetch()}
            isFetching={isFetching}
          />
          <Button asChild className="min-h-11 shrink-0">
            <Link to="/portal/leads/new">
              <Plus className="mr-2 h-4 w-4" />
              New lead
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Label htmlFor="lead-search" className="sr-only">
            Search Leads
          </Label>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="lead-search"
            placeholder="Search name, email, phone…"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="min-h-11 pl-9"
          />
        </div>
        <Select
          value={status}
            onValueChange={(v) => {
            setStatus(v as LeadStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger id="lead-status-filter" className="min-h-11 w-full sm:w-[200px]" aria-label="Filter by stage">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {leadStatusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAdmin && (
          <div className="w-full space-y-2 sm:w-[220px]">
            <Label htmlFor="lead-assignee" className="text-muted-foreground">
              Assigned rep
            </Label>
            <Select
              value={assigneeId || "__all__"}
              onValueChange={(v) => {
                setAssigneeId(v === "__all__" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger id="lead-assignee" className="min-h-11" aria-label="Filter by assigned rep">
                <SelectValue placeholder="All reps" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All reps</SelectItem>
                {repChoices.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.displayName ?? u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Created from</Label>
          <Input
            type="date"
            className="min-h-11 w-full sm:w-[200px]"
            value={fromInput}
            onChange={(e) => {
              setFromInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Created to</Label>
          <Input
            type="date"
            className="min-h-11 w-full sm:w-[200px]"
            value={toInput}
            onChange={(e) => {
              setToInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      {rangeInvalid && (
        <p className="text-sm text-destructive" role="alert">
          &quot;Created from&quot; must be on or before &quot;Created to&quot;.
        </p>
      )}
      {searchTooShort && (
        <p className="text-sm text-muted-foreground" role="status">
          Enter at least 2 characters to search.
        </p>
      )}

      {isError && (
        <QueryErrorAlert
          message="Could not load leads."
          onRetry={() => void refetch()}
        />
      )}

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!isLoading && data && data.items.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No leads match your filters.
          </CardContent>
        </Card>
      )}

      {/* Cards — mobile */}
      <div className="space-y-3 md:hidden">
        {data?.items.map((lead) => (
          <Link key={lead.id} to={`/portal/leads/${lead.id}`}>
            <Card className="transition-colors hover:bg-muted/40">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium leading-snug">{lead.clientName}</span>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {leadStatusLabel(lead.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                {lead.clientEmail && <p>{lead.clientEmail}</p>}
                {lead.clientPhone && <p>{lead.clientPhone}</p>}
                <p>
                  Advance {formatMinorUnits(lead.advanceAmountCents)} · Final quote{" "}
                  {formatMinorUnits(lead.finalQuoteCents)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Table — md+ */}
      <div className="hidden overflow-x-auto rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Advance</TableHead>
              <TableHead className="text-right">Final quote</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((lead) => (
              <TableRow key={lead.id} className="cursor-pointer">
                <TableCell>
                  <Link
                    to={`/portal/leads/${lead.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {lead.clientName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{leadStatusLabel(lead.status)}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMinorUnits(lead.advanceAmountCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMinorUnits(lead.finalQuoteCents)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(lead.updatedAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data && data.total > pageSize && (
        <nav
          className="flex flex-wrap items-center justify-center gap-2"
          aria-label="Leads pagination"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11 gap-1"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </Button>
          <span className="w-full basis-full px-2 text-center text-sm text-muted-foreground sm:w-auto sm:basis-auto">
            Page {page} of {totalPages} ({data.total} total)
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11 gap-1"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </nav>
      )}
    </div>
  );
}
