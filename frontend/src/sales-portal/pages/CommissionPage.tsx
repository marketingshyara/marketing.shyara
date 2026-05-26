import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, IndianRupee } from "lucide-react";
import {
  useAdminSettingsQuery,
  useCommissionsQuery,
  usePortalSettingsQuery,
  useSessionQuery
} from "../hooks/useSalesQueries";
import { DataStaleToolbar } from "../components/DataStaleToolbar";
import { PortalPageHeader } from "../components/PortalPageHeader";
import { QueryErrorAlert } from "../components/QueryErrorAlert";
import { CommissionSummaryBar } from "../components/commission/CommissionSummaryBar";
import {
  CommissionListRow,
  commissionListRateLabel
} from "../components/commission/CommissionListRow";
import { PortalEmptyState } from "../components/ui/PortalEmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  commissionValidationSettings,
  type CommissionValidationSettings
} from "../lib/commissionList";

type PaidFilter = "all" | "pending" | "paid";

export function CommissionPage() {
  const [page, setPage] = useState(1);
  const [paidFilter, setPaidFilter] = useState<PaidFilter>("all");
  const pageSize = 20;

  const sessionQr = useSessionQuery();
  const actorMode = sessionQr.data?.user?.role === "ADMIN" ? "admin" : "rep";

  const isPaidParam =
    paidFilter === "all" ? undefined : paidFilter === "paid";

  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } =
    useCommissionsQuery({
      page,
      pageSize,
      isPaid: isPaidParam
    });

  const repSettingsQr = usePortalSettingsQuery();
  const adminSettingsQr = useAdminSettingsQuery(actorMode === "admin");

  const validationSettings: CommissionValidationSettings | null = useMemo(() => {
    if (actorMode === "admin" && adminSettingsQr.data?.settings) {
      const s = adminSettingsQr.data.settings;
      return commissionValidationSettings(s, s);
    }
    if (repSettingsQr.data?.settings) {
      return commissionValidationSettings(repSettingsQr.data.settings, null);
    }
    return null;
  }, [actorMode, repSettingsQr.data, adminSettingsQr.data]);

  const settingsLoading =
    actorMode === "admin"
      ? adminSettingsQr.isLoading
      : repSettingsQr.isLoading;

  const rateLabel = validationSettings
    ? commissionListRateLabel(validationSettings)
    : "—";

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  const pageTitle = actorMode === "admin" ? "Commissions" : "Commission";
  const pageDescription =
    actorMode === "admin"
      ? "All rep payouts with deal basis and payout status."
      : "Your payouts after the client site goes live.";

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PortalPageHeader
        title={pageTitle}
        description={pageDescription}
        variant="config"
        toolbar={
          <DataStaleToolbar
            dataUpdatedAt={dataUpdatedAt}
            onRefresh={() => void refetch()}
            isFetching={isFetching}
          />
        }
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by payout status">
        {(
          [
            ["all", "All"],
            ["pending", "Pending"],
            ["paid", "Paid"]
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            type="button"
            variant={paidFilter === key ? "secondary" : "outline"}
            size="sm"
            className={cn("min-h-11 touch-manipulation")}
            role="tab"
            aria-selected={paidFilter === key}
            onClick={() => {
              setPaidFilter(key);
              setPage(1);
            }}
          >
            {label}
          </Button>
        ))}
      </div>

      {data?.summary ? <CommissionSummaryBar summary={data.summary} /> : null}

      {isError ? (
        <QueryErrorAlert message="Could not load commission." onRetry={() => void refetch()} />
      ) : isLoading || settingsLoading || !validationSettings ? (
        <Skeleton className="h-40 w-full" />
      ) : (data?.items.length ?? 0) === 0 ? (
        <PortalEmptyState
          icon={IndianRupee}
          title="No commission yet"
          description={
            actorMode === "admin"
              ? "Rows appear after deployment is verified and commission is calculated."
              : "Appears after admin verifies your client's live site."
          }
        />
      ) : (
        <ul className="space-y-3">
          {data!.items.map((row) => (
            <li key={row.id}>
              <CommissionListRow
                row={row}
                settings={validationSettings}
                actorMode={actorMode}
                rateLabel={rateLabel}
              />
            </li>
          ))}
        </ul>
      )}

      {(data?.items.length ?? 0) > 0 ? (
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
