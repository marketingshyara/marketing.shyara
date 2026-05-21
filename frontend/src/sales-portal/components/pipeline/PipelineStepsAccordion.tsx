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

type Props = {
  stages: PipelineStageView[];
  actorMode?: PipelineActorMode;
  onStageClick?: (key: PipelineStageKey) => void;
  mode?: "interactive" | "readonly";
};

export function PipelineStepsAccordion({
  stages,
  actorMode = "rep",
  onStageClick,
  mode = "interactive"
}: Props) {
  const [open, setOpen] = useState(false);
  const count = stages.length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        type="button"
        aria-label={`View all pipeline steps, ${count} total`}
        className="flex min-h-11 w-full touch-manipulation items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 active:bg-muted/60"
      >
        <span className="min-w-0 flex-1">View all steps ({count})</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <p className="mb-2 px-1 text-xs text-muted-foreground">
          Tap a step to open details. Completed steps may be view-only.
        </p>
        <PipelineProgress
          stages={stages}
          onStageClick={onStageClick}
          actorMode={actorMode}
          mode={mode}
          showActorHints={false}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
