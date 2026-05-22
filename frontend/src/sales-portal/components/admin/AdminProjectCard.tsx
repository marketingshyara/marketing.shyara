import { PipelineListSummary } from "../pipeline/PipelineListSummary";
import { listStatusChip } from "../../lib/pipelineCopy";
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
  const statusChip = listStatusChip(summary, project.pipelineStages, "admin");

  return (
    <PipelineListSummary
      clientName={project.clientName}
      summary={summary}
      agreedTotalCents={project.agreedTotalCents}
      href={`/portal/team/${repId}/projects/${project.id}`}
      statusChip={statusChip}
    />
  );
}
