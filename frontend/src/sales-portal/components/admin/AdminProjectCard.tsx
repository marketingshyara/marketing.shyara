import { PipelineListSummary } from "../pipeline/PipelineListSummary";
import { listBadgeLabel } from "../../lib/pipelineCopy";
import type { TeamRepProject } from "../../types";

type Props = {
  repId: string;
  project: TeamRepProject;
};

export function AdminProjectCard({ repId, project }: Props) {
  const summary = {
    currentStageKey: project.currentStageKey,
    currentStageTitle: project.currentStageTitle,
    pendingAdmin: project.pendingAdmin
  };
  const { label, variant } = listBadgeLabel(summary, project.pipelineStages, "admin");

  return (
    <PipelineListSummary
      clientName={project.clientName}
      summary={summary}
      agreedTotalCents={project.agreedTotalCents}
      href={`/portal/team/${repId}/projects/${project.id}`}
      badgeLabel={label}
      badgeVariant={variant}
    />
  );
}
