import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  getPipelineFocus,
  type PipelineActorMode,
  whoActsNext
} from "../../lib/pipelineCopy";
import type { PipelineStageKey, PipelineStageView } from "../../types";

type Props = {
  stages: PipelineStageView[];
  actorMode: PipelineActorMode;
  onPrimaryAction: (key: PipelineStageKey) => void;
  onViewSubmission?: (key: PipelineStageKey) => void;
};

export function PipelineFocusCard({ stages, actorMode, onPrimaryAction, onViewSubmission }: Props) {
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
      <CardHeader className="pb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {focus.kind === "idle" ? "Status" : "What to do now"}
        </p>
        <CardTitle className="break-words text-lg md:text-xl">{focus.headline}</CardTitle>
        {focus.stage ? (
          <CardDescription className="break-words text-sm leading-relaxed">
            {focus.description}
          </CardDescription>
        ) : null}
        {focus.stage && focus.kind !== "idle" ? (
          <p className="text-xs text-muted-foreground pt-1">
            {whoActsNext(focus.stage, actorMode)}
          </p>
        ) : null}
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
