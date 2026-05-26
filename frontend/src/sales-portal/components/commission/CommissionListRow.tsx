import { AlertTriangle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PortalStatusChip } from "../ui/PortalStatusChip";
import { cn } from "@/lib/utils";
import type { CommissionListItem } from "../../types";
import { commissionRateLabel } from "../../lib/commissionEstimate";
import type { CommissionValidationSettings } from "../../lib/commissionList";
import {
  commissionDetailHref,
  commissionRowStage,
  formatCommissionPaidAt,
  rowIntegrityIssues
} from "../../lib/commissionList";
import { formatMinorUnits } from "../../lib/money";

type Props = {
  row: CommissionListItem;
  settings: CommissionValidationSettings;
  actorMode: "rep" | "admin";
  rateLabel: string;
};

const STAGE_LABELS = ["Site live", "Calculated", "Paid"] as const;

function StageStrip({ row }: { row: CommissionListItem }) {
  const stage = commissionRowStage(row);
  const done = [stage.siteLive, stage.calculated, stage.paid];

  return (
    <div
      className="flex flex-wrap gap-1.5"
      role="list"
      aria-label="Commission progress for this deal"
    >
      {STAGE_LABELS.map((label, i) => (
        <span
          key={label}
          role="listitem"
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide sm:text-xs",
            done[i]
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function CommissionListRow({ row, settings, actorMode, rateLabel }: Props) {
  const issues = rowIntegrityIssues(row, settings);
  const href = commissionDetailHref(row, actorMode);
  const paidLabel = formatCommissionPaidAt(row.paidAt);
  const dealAmount =
    row.lead.agreedTotalCents != null
      ? formatMinorUnits(row.lead.agreedTotalCents)
      : "—";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Link
          to={href}
          className="flex min-h-11 flex-col gap-3 p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:gap-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium truncate">{row.lead.clientName}</p>
              {actorMode === "admin" ? (
                <p className="text-xs text-muted-foreground truncate">
                  Rep: {row.rep.displayName ?? row.rep.id}
                </p>
              ) : null}
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          </div>

          <StageStrip row={row} />

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Deal amount</dt>
              <dd className="font-medium tabular-nums">{dealAmount}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Commission rate</dt>
              <dd className="font-medium">{rateLabel}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Commission</dt>
              <dd className="font-semibold tabular-nums">
                {formatMinorUnits(row.amountCents)}
                {row.bonusCents > 0
                  ? ` + ${formatMinorUnits(row.bonusCents)} bonus`
                  : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="flex flex-col items-start gap-1">
                <PortalStatusChip
                  kind={row.isPaid ? "complete" : "waiting"}
                  label={row.isPaid ? "Paid" : "Pending payout"}
                />
                {paidLabel ? (
                  <span className="text-xs text-muted-foreground">Paid on {paidLabel}</span>
                ) : null}
              </dd>
            </div>
          </dl>
        </Link>

        {issues.length > 0 ? (
          <div
            className="border-t border-destructive/30 bg-destructive/5 px-4 py-3"
            role="alert"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className="h-4 w-4 shrink-0 text-destructive mt-0.5"
                aria-hidden
              />
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-semibold text-destructive">
                  Does not match portal settings
                </p>
                <ul className="list-disc space-y-0.5 pl-4 text-xs text-destructive/90">
                  {issues.map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function commissionListRateLabel(settings: CommissionValidationSettings): string {
  return commissionRateLabel(settings as Parameters<typeof commissionRateLabel>[0]);
}
