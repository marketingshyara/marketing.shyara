import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatMinorUnits } from "../../lib/money";
import { stageShortTitle } from "../../lib/pipelineCopy";
import type { LeadPipelineSummary } from "../../types";

type Props = {
  clientName: string;
  summary: LeadPipelineSummary;
  agreedTotalCents: number | null;
  href: string;
  badgeLabel: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
  waitingSubline?: string | null;
};

export function PipelineListSummary({
  clientName,
  summary,
  agreedTotalCents,
  href,
  badgeLabel,
  badgeVariant,
  waitingSubline
}: Props) {
  const stepLine = stageShortTitle(summary.currentStageKey, summary.currentStageTitle);

  return (
    <Link
      to={href}
      className="flex min-h-11 w-full min-w-0 flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/40 active:bg-muted/60 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="min-w-0 truncate font-medium text-primary">{clientName}</span>
          <Badge variant={badgeVariant} className="max-w-full shrink-0 truncate">
            {badgeLabel}
          </Badge>
        </div>
        <p className="break-words text-sm text-muted-foreground">
          Current step: <span className="font-medium text-foreground">{stepLine}</span>
          {waitingSubline ? (
            <>
              <br />
              <span>{waitingSubline}</span>
            </>
          ) : null}
        </p>
        {agreedTotalCents != null ? (
          <p className="text-xs text-muted-foreground">{formatMinorUnits(agreedTotalCents)}</p>
        ) : null}
      </div>
      <span className="flex min-h-11 shrink-0 items-center text-sm font-medium text-primary">
        Open →
      </span>
    </Link>
  );
}
