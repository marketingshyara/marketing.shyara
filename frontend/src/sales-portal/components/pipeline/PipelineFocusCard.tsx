import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getPipelineFocus, type PipelineActorMode } from "../../lib/pipelineCopy";
import type { PipelineStageKey, PipelineStageView } from "../../types";
import { PortalStatusChip } from "../ui/PortalStatusChip";
import { PortalWhyBlocked } from "../ui/PortalWhyBlocked";

type Props = {
  stages: PipelineStageView[];
  actorMode: PipelineActorMode;
  onPrimaryAction: (key: PipelineStageKey) => void;
  onViewSubmission?: (key: PipelineStageKey) => void;
  /** Shown under the headline when rep is waiting on admin (e.g. payment submitted). */
  waitingDetail?: string | null;
};

export function PipelineFocusCard({
  stages,
  actorMode,
  onPrimaryAction,
  onViewSubmission,
  waitingDetail
}: Props) {
  const focus = getPipelineFocus(stages, actorMode);
  const urgent = focus.kind === "action";
  const waiting = focus.kind === "waiting";

  const handlePrimary = () => {
    if (!focus.stageKey) return;
    if (focus.showViewSubmission && onViewSubmission) {
      onViewSubmission(focus.stageKey);
      return;
    }
    onPrimaryAction(focus.stageKey);
  };

  return (
    <Card
      className={cn(
        "w-full min-w-0 border-2",
        urgent && "border-primary bg-primary/5",
        waiting && "border-amber-500/60 bg-amber-500/5",
        focus.kind === "idle" && "border-muted"
      )}
    >
      <CardHeader className="space-y-2 pb-2">
        <PortalStatusChip kind={focus.statusChip.kind} label={focus.statusChip.label} />
        <CardTitle className="break-words text-lg md:text-xl">{focus.headline}</CardTitle>
        {waitingDetail ?? focus.detail ? (
          <p className="break-words text-sm text-muted-foreground">
            {waitingDetail ?? focus.detail}
          </p>
        ) : null}
        <PortalWhyBlocked reasons={focus.expandReasons} />
      </CardHeader>
      {focus.primaryLabel && focus.stageKey ? (
        <CardContent className="flex flex-col gap-2 pt-0 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            className="min-h-11 w-full touch-manipulation sm:w-auto"
            variant={urgent ? "default" : "secondary"}
            onClick={handlePrimary}
          >
            {focus.primaryLabel}
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
