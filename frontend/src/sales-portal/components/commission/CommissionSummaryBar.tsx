import { Calculator, Clock, Globe, Info, Wallet } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CommissionsListSummary } from "../../types";

const PAYOUT_TIMING_VALUE = "3–5 business days";
const PAYOUT_TIMING_TOOLTIP = "Paid 3–5 business days after deployment verify.";

type Props = {
  summary: CommissionsListSummary;
  className?: string;
};

type StatColumn = {
  label: string;
  value: string;
  icon: typeof Globe;
  tooltip?: string;
};

export function CommissionSummaryBar({ summary, className }: Props) {
  const columns: StatColumn[] = [
    { label: "Site live", value: String(summary.siteLive), icon: Globe },
    { label: "Calculated", value: String(summary.calculated), icon: Calculator },
    { label: "Paid", value: String(summary.paid), icon: Wallet },
    {
      label: "Payout timing",
      value: PAYOUT_TIMING_VALUE,
      icon: Clock,
      tooltip: PAYOUT_TIMING_TOOLTIP
    }
  ];

  return (
    <TooltipProvider>
      <div
        className={cn(
          "grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-4 sm:p-4",
          className
        )}
        role="group"
        aria-label="Commission summary"
      >
        {columns.map((col) => {
          const Icon = col.icon;
          const body = (
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Icon className="h-5 w-5 text-primary" aria-hidden />
              <span className="text-xs font-medium text-muted-foreground">{col.label}</span>
              <span className="text-sm font-semibold tabular-nums leading-tight">{col.value}</span>
            </div>
          );

          if (col.tooltip) {
            return (
              <div key={col.label} className="min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="w-full min-h-11 rounded-md touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {body}
                      <span className="sr-only">. {col.tooltip}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">{col.tooltip}</TooltipContent>
                </Tooltip>
              </div>
            );
          }

          return (
            <div key={col.label} className="min-w-0">
              {body}
            </div>
          );
        })}
      </div>
      <p className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          Payouts are processed within {PAYOUT_TIMING_VALUE} after deployment is verified.
        </span>
      </p>
    </TooltipProvider>
  );
}
