import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PipelineStageKey, PipelineStageView } from "../../types";
import { VerificationTick } from "./VerificationTick";

type Props = {
  stages: PipelineStageView[];
  onStageClick?: (key: PipelineStageKey) => void;
  mode?: "interactive" | "readonly";
  /** Who is viewing: controls which steps are clickable in interactive mode */
  actorMode?: "rep" | "admin";
  compact?: boolean;
  highlightKey?: PipelineStageKey;
  /** Hide per-row “Sales rep / Admin” hints (accordion view) */
  showActorHints?: boolean;
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

export function PipelineProgress({
  stages,
  onStageClick,
  mode = "interactive",
  actorMode = "rep",
  compact = false,
  highlightKey,
  showActorHints = true
}: Props) {
  const readonly = mode === "readonly";
  const list = (
    <ol className={compact ? "space-y-1" : "space-y-2"}>
      {stages.map((stage) => {
        const canOpen =
          !readonly && !!onStageClick && stageIsClickable(stage, actorMode);
        const highlighted = highlightKey === stage.key;
        const row = (
          <>
            <VerificationTick state={stage.state} stageKey={stage.key} />
            <div className="min-w-0 flex-1">
              <span
                className={
                  compact
                    ? "text-xs font-medium"
                    : "text-sm font-medium"
                }
              >
                {stage.title}
              </span>
              {!compact && stage.hint ? (
                <p className="text-xs text-muted-foreground">{stage.hint}</p>
              ) : null}
              {!compact && stage.state === "locked" && stage.blockedReason ? (
                <p className="text-xs text-muted-foreground">{stage.blockedReason}</p>
              ) : null}
              {!compact && showActorHints ? (
                <p className="text-xs text-muted-foreground">
                  {stage.repActor && stage.adminActor
                    ? "Sales rep & admin"
                    : stage.repActor
                      ? "Sales rep"
                      : stage.adminActor
                        ? "Admin"
                        : ""}
                </p>
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
              >
                {row}
              </Button>
            )}
          </li>
        );
      })}
    </ol>
  );

  if (compact) {
    return list;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Project progress</CardTitle>
      </CardHeader>
      <CardContent>{list}</CardContent>
    </Card>
  );
}
