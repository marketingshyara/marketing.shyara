import { Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import type { PipelineStageKey, PipelineStageView } from "../../types";
import { VerificationTick } from "./VerificationTick";

type Props = {
  stages: PipelineStageView[];
  onStageClick?: (key: PipelineStageKey) => void;
  mode?: "interactive" | "readonly";
  actorMode?: "rep" | "admin";
  compact?: boolean;
  highlightKey?: PipelineStageKey;
  showActorHints?: boolean;
  /** Show hints/blocked only on highlighted (current) step */
  detailsOnHighlightOnly?: boolean;
};

function stageIsClickable(stage: PipelineStageView, actorMode: "rep" | "admin"): boolean {
  if (actorMode === "rep") {
    if (stage.adminActor && !stage.repActor) {
      return false;
    }
    if (stage.state === "actionable") {
      return true;
    }
    if (stage.state === "pending_admin" && stage.repActor) {
      return true;
    }
    if (stage.state === "verified") {
      return stage.repActor;
    }
    return false;
  }
  if (!stage.adminActor) {
    return false;
  }
  return stage.state === "actionable" || stage.state === "pending_admin" || stage.state === "verified";
}

function StageRoleIcons({ stage }: { stage: PipelineStageView }) {
  if (!stage.repActor && !stage.adminActor) return null;
  const repOnly = stage.repActor && !stage.adminActor;
  const adminOnly = stage.adminActor && !stage.repActor;
  const both = stage.repActor && stage.adminActor;

  return (
    <span className="inline-flex items-center gap-0.5 text-muted-foreground" aria-hidden>
      {(repOnly || both) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <User className="h-3 w-3" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">Sales rep</TooltipContent>
        </Tooltip>
      )}
      {(adminOnly || both) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Shield className="h-3 w-3" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">Admin</TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}

export function PipelineProgress({
  stages,
  onStageClick,
  mode = "interactive",
  actorMode = "rep",
  compact = false,
  highlightKey,
  showActorHints = true,
  detailsOnHighlightOnly = true
}: Props) {
  const readonly = mode === "readonly";
  const list = (
    <TooltipProvider delayDuration={300}>
      <ol className={compact ? "space-y-1" : "space-y-2"}>
        {stages.map((stage) => {
          const canOpen =
            !readonly && !!onStageClick && stageIsClickable(stage, actorMode);
          const highlighted = highlightKey === stage.key;
          const showDetails =
            !compact && (!detailsOnHighlightOnly || highlighted);
          const row = (
            <>
              <VerificationTick state={stage.state} stageKey={stage.key} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={
                      compact ? "text-xs font-medium" : "text-sm font-medium"
                    }
                  >
                    {stage.title}
                  </span>
                  {showActorHints ? <StageRoleIcons stage={stage} /> : null}
                </div>
                {showDetails && stage.hint ? (
                  <p className="text-xs text-muted-foreground">{stage.hint}</p>
                ) : null}
                {showDetails && stage.state === "locked" && stage.blockedReason ? (
                  <p className="text-xs text-muted-foreground">{stage.blockedReason}</p>
                ) : null}
              </div>
            </>
          );
          return (
            <li
              key={stage.key}
              className={highlighted ? "rounded-md bg-muted/60" : undefined}
            >
              {readonly ? (
                <div
                  className={`flex w-full items-start gap-3 px-2 py-2 ${compact ? "py-1" : ""}`}
                >
                  {row}
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto min-h-11 w-full touch-manipulation justify-start gap-3 px-2 py-2 text-left font-normal"
                  disabled={!canOpen}
                  onClick={() => canOpen && onStageClick!(stage.key)}
                  aria-label={`${stage.title}, ${stage.state}`}
                >
                  {row}
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </TooltipProvider>
  );

  if (compact) {
    return list;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">All steps</CardTitle>
      </CardHeader>
      <CardContent>{list}</CardContent>
    </Card>
  );
}
