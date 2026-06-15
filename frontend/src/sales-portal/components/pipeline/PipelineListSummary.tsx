import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { formatMinorUnits } from "../../lib/money";
import { modelBRepPipelineStepLine } from "../../lib/modelBRepUi";
import type { LeadPipelineSummary } from "../../types";
import { PortalStatusChip, type PortalStatusChipKind } from "../ui/PortalStatusChip";

type Props = {
  clientName: string;
  summary: LeadPipelineSummary;
  agreedTotalCents: number | null;
  href: string;
  statusChip: { kind: PortalStatusChipKind; label: string };
  trailingAction?: ReactNode;
  /** Optional second line (e.g. rep name on admin all-clients list). */
  detailLine?: ReactNode;
  /** Model B reps see payout terminology on the commission step. */
  isModelBRep?: boolean;
};

export function PipelineListSummary({
  clientName,
  summary,
  agreedTotalCents,
  href,
  statusChip,
  trailingAction,
  detailLine,
  isModelBRep = false
}: Props) {
  const stepLine = modelBRepPipelineStepLine(
    summary.currentStageKey,
    summary.currentStageTitle,
    isModelBRep
  );

  return (
    <div
      className={
        trailingAction
          ? "flex min-w-0 flex-col rounded-lg border touch-manipulation sm:flex-row sm:items-stretch"
          : "flex min-w-0 items-stretch gap-0 rounded-lg border touch-manipulation"
      }
    >
    <Link
      to={href}
      className="flex min-h-11 min-w-0 flex-1 items-center gap-3 p-4 transition-colors hover:bg-muted/40 active:bg-muted/60"
      aria-label={`Open project for ${clientName}`}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="min-w-0 truncate font-medium text-primary">{clientName}</span>
          <PortalStatusChip kind={statusChip.kind} label={statusChip.label} />
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{stepLine}</span>
          {agreedTotalCents != null ? (
            <span className="text-muted-foreground"> · {formatMinorUnits(agreedTotalCents)}</span>
          ) : null}
        </p>
        {detailLine ? <p className="text-xs text-muted-foreground">{detailLine}</p> : null}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
    {trailingAction ? (
      <div className="flex shrink-0 items-center justify-stretch border-t px-3 py-2 sm:justify-center sm:border-l sm:border-t-0 sm:px-2 sm:py-0">
        <div className="w-full sm:w-auto">{trailingAction}</div>
      </div>
    ) : null}
    </div>
  );
}
