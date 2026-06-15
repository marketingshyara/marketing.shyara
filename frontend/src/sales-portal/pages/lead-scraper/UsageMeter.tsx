import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { LeadScraperUsageResponse } from "../../types";

export function UsageMeter({
  usage,
  compact = false,
  className
}: {
  usage: LeadScraperUsageResponse | undefined;
  compact?: boolean;
  className?: string;
}) {
  if (!usage) return null;
  const pct = usage.user.limit > 0 ? Math.min(100, (usage.user.used / usage.user.limit) * 100) : 0;
  const userLow = usage.user.remaining <= 5;
  const globalLow = usage.global.remaining <= 10;

  return (
    <div
      className={cn(
        "border-2 border-[#0A0A0A] bg-white p-3 shadow-[2px_2px_0_0_#0A0A0A]",
        className
      )}
    >
      <div className="flex items-end justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]/60">
          Searches this month
        </span>
        <span
          className={cn(
            "font-mono text-xs font-bold",
            userLow ? "text-[#FF3333]" : "text-[#0A0A0A]"
          )}
        >
          {usage.user.used} / {usage.user.limit}
        </span>
      </div>
      <Progress value={pct} className="mt-2 h-1.5" aria-label="Monthly search usage" />
      {compact ? (
        <p className={cn("mt-2 text-xs", globalLow ? "text-[#FF3333]" : "text-[#0A0A0A]/60")}>
          Org pool {usage.global.used}/{usage.global.limit} · Resets {usage.resetsOn}
        </p>
      ) : (
        <p className="mt-2 text-xs text-[#0A0A0A]/60">
          Resets {usage.resetsOn}. Global pool {usage.global.used}/{usage.global.limit}.
        </p>
      )}
    </div>
  );
}
