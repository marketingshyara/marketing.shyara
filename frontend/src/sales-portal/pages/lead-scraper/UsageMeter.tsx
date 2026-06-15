import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { LeadScraperUsageResponse } from "../../types";

export function UsageMeter({
  usage,
  className
}: {
  usage: LeadScraperUsageResponse | undefined;
  /** Kept for call sites; rep UI always shows personal quota only. */
  compact?: boolean;
  className?: string;
}) {
  if (!usage) return null;
  const pct = usage.user.limit > 0 ? Math.min(100, (usage.user.used / usage.user.limit) * 100) : 0;
  const userLow = usage.user.remaining <= 5;

  return (
    <div
      className={cn(
        "border-2 border-[#0A0A0A] bg-white p-3 shadow-[2px_2px_0_0_#0A0A0A]",
        className
      )}
    >
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]/60">
          Your searches this month
        </p>
        <div className="flex items-baseline justify-between gap-3">
          <span
            className={cn(
              "whitespace-nowrap font-mono text-sm font-bold tabular-nums",
              userLow ? "text-[#FF3333]" : "text-[#0A0A0A]"
            )}
          >
            {usage.user.used}
            <span className="text-[#0A0A0A]/50"> / </span>
            {usage.user.limit}
          </span>
        </div>
      </div>
      <Progress value={pct} className="mt-2 h-1.5" aria-label="Your monthly search usage" />
      <p className="mt-2 text-xs text-[#0A0A0A]/60">Resets {usage.resetsOn}.</p>
    </div>
  );
}
