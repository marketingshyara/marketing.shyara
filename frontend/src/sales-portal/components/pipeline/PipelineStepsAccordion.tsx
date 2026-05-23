import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { PipelineProgress } from "./PipelineProgress";
import type { PipelineStageKey, PipelineStageView } from "../../types";
import type { PipelineActorMode } from "../../lib/pipelineCopy";
import { getPipelineFocus } from "../../lib/pipelineCopy";

type Props = {
  stages: PipelineStageView[];
  actorMode?: PipelineActorMode;
  onStageClick?: (key: PipelineStageKey) => void;
  mode?: "interactive" | "readonly";
  repPreviewUrl?: string | null;
};

export function PipelineStepsAccordion({
  stages,
  actorMode = "rep",
  onStageClick,
  mode = "interactive",
  repPreviewUrl
}: Props) {
  const [open, setOpen] = useState(false);
  const count = stages.length;
  const focus = getPipelineFocus(stages, actorMode);
  const highlightKey = focus.stageKey ?? undefined;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        type="button"
        aria-label={`View all pipeline steps, ${count} total`}
        aria-describedby="pipeline-steps-hint"
        className="flex min-h-11 w-full touch-manipulation items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 active:bg-muted/60"
      >
        <span className="min-w-0 flex-1">All steps ({count})</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </CollapsibleTrigger>
      <span id="pipeline-steps-hint" className="sr-only">
        Expand to see every step. Tap a step to open it when available.
      </span>
      <CollapsibleContent className="pt-3">
        <PipelineProgress
          stages={stages}
          onStageClick={onStageClick}
          actorMode={actorMode}
          mode={mode}
          showActorHints={false}
          highlightKey={highlightKey}
          detailsOnHighlightOnly
          repPreviewUrl={repPreviewUrl}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
