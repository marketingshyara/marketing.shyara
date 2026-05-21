import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PipelineProgress } from "../pipeline/PipelineProgress";
import type { TeamRepProject } from "../../types";
import { formatMinorUnits } from "../../lib/money";
import { leadStatusLabel } from "../../lib/copy";

type Props = {
  repId: string;
  project: TeamRepProject;
};

export function AdminProjectCard({ repId, project }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="min-w-0">
          <CardTitle className="text-base leading-tight">
            <Link
              to={`/portal/team/${repId}/projects/${project.id}`}
              className="hover:underline"
            >
              {project.clientName}
            </Link>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {leadStatusLabel(project.status)}
            {project.agreedTotalCents != null
              ? ` · ${formatMinorUnits(project.agreedTotalCents)}`
              : ""}
          </p>
        </div>
        {project.pendingAdmin ? (
          <Badge variant="secondary" className="shrink-0">
            Needs you
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Current: <span className="font-medium text-foreground">{project.currentStageTitle}</span>
        </p>
        <PipelineProgress
          stages={project.pipelineStages}
          mode="readonly"
          compact
          highlightKey={project.currentStageKey}
        />
      </CardContent>
    </Card>
  );
}
