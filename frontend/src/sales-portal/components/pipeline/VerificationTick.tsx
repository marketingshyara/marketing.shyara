import { Check, Circle, Clock } from "lucide-react";
import type { PipelineStageKey, StageUiState } from "../../types";
import { cn } from "@/lib/utils";
import { stageWasAdminVerified, tickAriaLabel } from "../../lib/pipelineCopy";

type Props = {
  state: StageUiState;
  stageKey?: PipelineStageKey;
  className?: string;
};

export function VerificationTick({ state, stageKey, className }: Props) {
  const adminVerified =
    state === "verified" && stageKey != null && stageWasAdminVerified(stageKey);

  if (state === "verified") {
    return (
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center border-2 border-[#0A0A0A] bg-[#FF3333] text-white",
          className
        )}
        aria-label={tickAriaLabel(state, adminVerified)}
      >
        <Check className="h-4 w-4" aria-hidden />
      </span>
    );
  }
  if (state === "pending_admin") {
    return (
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center border-2 border-[#0A0A0A] bg-[#0A0A0A] text-white",
          className
        )}
        aria-label={tickAriaLabel(state, false)}
      >
        <Clock className="h-4 w-4" aria-hidden />
      </span>
    );
  }
  if (state === "actionable") {
    return (
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center border-2 border-[#FF3333] bg-white text-[#FF3333]",
          className
        )}
        aria-label={tickAriaLabel(state, false)}
      >
        <Circle className="h-3 w-3 fill-current" aria-hidden />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center border-2 border-[#0A0A0A]/30 text-[#0A0A0A]/40",
        className
      )}
      aria-label={tickAriaLabel(state, false)}
    >
      <Circle className="h-3 w-3" aria-hidden />
    </span>
  );
}
