import { CheckCircle2, IndianRupee } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Site live", icon: CheckCircle2 },
  { label: "Calculated", icon: IndianRupee },
  { label: "Paid", icon: CheckCircle2 }
] as const;

type Props = {
  className?: string;
};

export function CommissionTimeline({ className }: Props) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-col gap-3 rounded-lg border bg-muted/30 px-3 py-3 sm:flex-row sm:items-center sm:px-4",
          className
        )}
        role="img"
        aria-label="Commission: site verified, calculated, paid within 3 to 5 business days"
      >
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex flex-col items-center gap-1 text-center">
                <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                <span className="text-xs font-medium leading-tight">{step.label}</span>
              </div>
            );
          })}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="min-h-11 shrink-0 self-center text-xs text-muted-foreground underline-offset-2 hover:underline touch-manipulation sm:min-h-0"
            >
              Payout timing
            </button>
          </TooltipTrigger>
          <TooltipContent>Paid 3–5 business days after deployment verify.</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
