import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useActivityLogsQuery } from "../hooks/useSalesQueries";
import { useDebounced } from "../hooks/useDebounced";
import { DataStaleToolbar } from "../components/DataStaleToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorAlert } from "../components/QueryErrorAlert";

export function ActivityLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(() => Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = 20;
  const [userId, setUserId] = useState(searchParams.get("userId") ?? "");
  const [entityType, setEntityType] = useState(searchParams.get("entityType") ?? "");
  const [entityId, setEntityId] = useState(searchParams.get("entityId") ?? "");
  const debouncedUserId = useDebounced(userId, 300);
  const debouncedEntityType = useDebounced(entityType, 300);
  const debouncedEntityId = useDebounced(entityId, 300);

  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useActivityLogsQuery({
    page,
    pageSize,
    userId: debouncedUserId.trim() || undefined,
    entityType: debouncedEntityType.trim() || undefined,
    entityId: debouncedEntityId.trim() || undefined,
    enabled: true
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  useEffect(() => {
    setPage(1);
  }, [debouncedUserId, debouncedEntityType, debouncedEntityId]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (page > 1) next.set("page", String(page));
    else next.delete("page");
    if (debouncedUserId.trim()) next.set("userId", debouncedUserId.trim());
    else next.delete("userId");
    if (debouncedEntityType.trim()) next.set("entityType", debouncedEntityType.trim());
    else next.delete("entityType");
    if (debouncedEntityId.trim()) next.set("entityId", debouncedEntityId.trim());
    else next.delete("entityId");
    setSearchParams(next, { replace: true });
  }, [
    debouncedEntityId,
    debouncedEntityType,
    debouncedUserId,
    page,
    searchParams,
    setSearchParams
  ]);

  useEffect(() => {
    if (data == null) return;
    const tp = Math.max(1, Math.ceil(data.total / pageSize));
    setPage((p) => Math.min(p, tp));
  }, [data, pageSize]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Activity logs</h1>
          <p className="text-sm text-muted-foreground">Audit trail for admin review.</p>
        </div>
        {!isLoading && (
          <DataStaleToolbar
            dataUpdatedAt={dataUpdatedAt}
            onRefresh={() => void refetch()}
            isFetching={isFetching}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="activity-user-id">User ID</Label>
          <Input
            id="activity-user-id"
            className="min-h-11"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Filter by user ID…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="activity-entity-type">Area</Label>
          <Input
            id="activity-entity-type"
            className="min-h-11"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            placeholder="Lead, User, Payment…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="activity-entity-id">Item ID</Label>
          <Input
            id="activity-entity-id"
            className="min-h-11"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            placeholder="Filter by item ID…"
          />
        </div>
      </div>

      {isError && (
        <QueryErrorAlert
          message="Could not load activity logs."
          onRetry={() => void refetch()}
        />
      )}

      {isLoading && <Skeleton className="h-64 w-full" />}

      <div className="space-y-3 md:hidden">
        {data?.items.map((row) => (
          <div
            key={row.id}
            className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
          >
            <p className="text-xs text-muted-foreground">
              {new Date(row.createdAt).toLocaleString()}
            </p>
            <p className="mt-1 font-medium">{row.action}</p>
            <p className="mt-2 break-words text-sm">
              <span className="text-muted-foreground">Entity: </span>
              {row.entityType} / {row.entityId}
            </p>
            <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
              User: {row.userId ?? "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <div className="-mx-1 overflow-x-auto rounded-md border px-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(row.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>{row.action}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm">
                  {row.entityType} / {row.entityId}
                </TableCell>
                <TableCell className="font-mono text-xs">{row.userId ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      {data && totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center justify-center gap-2"
          aria-label="Activity logs pagination"
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
