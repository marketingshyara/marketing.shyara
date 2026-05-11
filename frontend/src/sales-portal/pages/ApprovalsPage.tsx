import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounced } from "../hooks/useDebounced";
import { usePendingPaymentsQuery } from "../hooks/useSalesQueries";
import { formatMinorUnits } from "../lib/money";
import { DataStaleToolbar } from "../components/DataStaleToolbar";
import { LeadVerifyDialog } from "../components/lead-detail/LeadVerifyDialog";
import { QueryErrorAlert } from "../components/QueryErrorAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { PaymentKind } from "../types";

const KINDS: (PaymentKind | "all")[] = ["all", "ADVANCE", "FINAL"];

export function ApprovalsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [kind, setKind] = useState<PaymentKind | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounced(searchInput, 300);
  const searchTrimmed = search.trim();
  const searchTooShort = searchTrimmed.length > 0 && searchTrimmed.length < 2;

  useEffect(() => {
    setPage(1);
  }, [kind, searchTrimmed]);

  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = usePendingPaymentsQuery({
    page,
    pageSize,
    kind: kind === "all" ? undefined : kind,
    search: searchTooShort ? undefined : searchTrimmed || undefined,
    enabled: !searchTooShort
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  useEffect(() => {
    if (data == null) return;
    const tp = Math.max(1, Math.ceil(data.total / pageSize));
    setPage((p) => Math.min(p, tp));
  }, [data, pageSize]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Payment approvals</h1>
          <p className="text-sm text-muted-foreground">
            Pending advance and final payments awaiting verification.
          </p>
        </div>
        <DataStaleToolbar
          dataUpdatedAt={dataUpdatedAt}
          onRefresh={() => refetch()}
          isFetching={isFetching}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Label htmlFor="approval-search" className="sr-only">
            Search by client name
          </Label>
          <Input
            id="approval-search"
            placeholder="Search client name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="min-h-11"
          />
        </div>
        <Select
          value={kind}
          onValueChange={(v) => setKind(v as PaymentKind | "all")}
        >
          <SelectTrigger id="approval-kind" className="min-h-11 w-full sm:w-[200px]" aria-label="Payment kind">
            <SelectValue placeholder="Kind" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All kinds</SelectItem>
            {KINDS.filter((k) => k !== "all").map((k) => (
              <SelectItem key={k} value={k}>
                {k === "ADVANCE" ? "Advance" : "Final"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {searchTooShort && (
        <p className="text-sm text-muted-foreground" role="status">
          Enter at least 2 characters to search.
        </p>
      )}

      {isError && (
        <QueryErrorAlert message="Could not load pending payments." onRetry={() => void refetch()} />
      )}

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {!isLoading && data && data.items.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No pending payments.
          </CardContent>
        </Card>
      )}

      <div className="hidden overflow-x-auto rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Marked by</TableHead>
              <TableHead>Marked at</TableHead>
              <TableHead>Rep note</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link
                    to={`/portal/leads/${p.lead.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {p.lead.clientName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{p.kind === "ADVANCE" ? "Advance" : "Final"}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatMinorUnits(p.amountCents)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.markedBy.displayName ?? p.markedBy.email}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(p.markedAt).toLocaleString()}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground" title={p.repNote ?? ""}>
                  {p.repNote ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <LeadVerifyDialog leadId={p.lead.id} paymentId={p.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {data?.items.map((p) => (
          <Card key={p.id}>
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <Link to={`/portal/leads/${p.lead.id}`} className="font-medium text-primary">
                  {p.lead.clientName}
                </Link>
                <Badge variant="outline">{p.kind === "ADVANCE" ? "Advance" : "Final"}</Badge>
              </div>
              <p className="text-sm tabular-nums">{formatMinorUnits(p.amountCents)}</p>
              <p className="text-xs text-muted-foreground">
                {p.markedBy.displayName ?? p.markedBy.email} · {new Date(p.markedAt).toLocaleString()}
              </p>
              <LeadVerifyDialog leadId={p.lead.id} paymentId={p.id} />
            </CardContent>
          </Card>
        ))}
      </div>

      {data && data.total > pageSize && (
        <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Approvals pagination">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11 gap-1"
            disabled={page <= 1}
            onClick={() => setPage((x) => Math.max(1, x - 1))}
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
            onClick={() => setPage((x) => Math.min(totalPages, x + 1))}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </nav>
      )}
    </div>
  );
}
