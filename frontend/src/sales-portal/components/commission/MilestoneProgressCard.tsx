import type { MilestoneProgress } from "../../types";
import {
  modelBMilestoneReadyAdminHint,
  MODEL_B_MILESTONE_AMOUNT_CENTS_DEFAULT
} from "../../lib/copy";
import { formatMinorUnits } from "../../lib/money";

type Props = {
  milestone: MilestoneProgress;
  variant?: "rep" | "admin";
  milestoneAmountCents?: number;
};

export function MilestoneProgressCard({
  milestone,
  variant = "rep",
  milestoneAmountCents = MODEL_B_MILESTONE_AMOUNT_CENTS_DEFAULT
}: Props) {
  const pct = Math.min(
    100,
    Math.round((milestone.deployedCount / milestone.milestoneTarget) * 100)
  );

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">
          {variant === "admin" ? "Rep milestone progress" : "Your milestone progress"}
        </h2>
        <span className="text-sm tabular-nums text-muted-foreground">
          {milestone.deployedCount} of {milestone.milestoneTarget} site-live deals
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={milestone.deployedCount}
        aria-valuemin={0}
        aria-valuemax={milestone.milestoneTarget}
        aria-label="Site-live deals toward milestone"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span>
          Earned so far:{" "}
          <span className="font-medium tabular-nums">
            {formatMinorUnits(milestone.paidEarningsCents)}
          </span>
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{milestone.nextPayoutHint}</p>
      {variant === "admin" && milestone.milestoneReady ? (
        <p className="text-xs font-medium text-primary">
          {modelBMilestoneReadyAdminHint(milestoneAmountCents)}
        </p>
      ) : null}
    </div>
  );
}
