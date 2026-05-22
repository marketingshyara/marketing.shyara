import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { formatMinorUnits } from "../../lib/money";
import { stageShortTitle } from "../../lib/pipelineCopy";
import type { LeadPipelineSummary } from "../../types";
import { PortalStatusChip, type PortalStatusChipKind } from "../ui/PortalStatusChip";

type Props = {
  clientName: string;
  summary: LeadPipelineSummary;
  agreedTotalCents: number | null;
  href: string;
  statusChip: { kind: PortalStatusChipKind; label: string };
};

export function PipelineListSummary({
  clientName,
  summary,
  agreedTotalCents,
  href,
  statusChip
}: Props) {
  const stepLine = stageShortTitle(summary.currentStageKey, summary.currentStageTitle);

  return (
    <Link
      to={href}
      className="flex min-h-11 w-full min-w-0 items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/40 active:bg-muted/60"
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
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
