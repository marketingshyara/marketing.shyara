import { usePortalSession } from "@/components/portal/PortalGuards";
import {
  PortalPageHeader,
  PortalPanel,
  PortalSectionHeading,
  PortalStatusBadge
} from "@/components/portal/portal-ui";
import { formatPortalDateTime, formatPortalLabel, portalSelectClass } from "@/components/portal/portal-theme";
import { portalApi } from "@/lib/portal-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const projectStatuses = [
  "project_started",
  "content_pending",
  "in_progress",
  "preview_shared",
  "revision_pending",
  "revision_in_progress",
  "final_delivery_done",
  "closed"
];

export default function PortalProjectsPage() {
  const queryClient = useQueryClient();
  const session = usePortalSession();
  const projects = useQuery({ queryKey: ["portal-projects"], queryFn: portalApi.projects });
  const leads = useQuery({ queryKey: ["portal-leads", "projects-context"], queryFn: () => portalApi.leads() });
  const updateProject = useMutation({
    mutationFn: ({ projectId, status }: { projectId: string; status: string }) =>
      portalApi.updateProjectStatus(projectId, { status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portal-projects"] });
    }
  });

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Delivery Pipeline"
        title="Track handoff progress after a lead closes"
        description="Projects now sit on the same surface, spacing, and status system as the main website while keeping delivery state changes fast for operations."
      />

      <PortalPanel>
        <PortalSectionHeading
          title="Closed Lead Project Tracking"
          description="Monitor delivery stage, revision stage, and completion timestamps from one board."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {projects.data?.map((project) => {
            const lead = leads.data?.find((entry) => entry.id === project.leadId);
            return (
              <div key={project.id} className="portal-list-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{lead?.businessName ?? project.leadId}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lead?.contactPersonName ?? "Lead context unavailable"}
                    </p>
                  </div>
                  <PortalStatusBadge status={project.status} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-caption uppercase tracking-[0.16em] text-muted-foreground">Started</p>
                    <p className="mt-1 text-sm text-foreground">{formatPortalDateTime(project.startedAt)}</p>
                  </div>
                  <div>
                    <p className="text-caption uppercase tracking-[0.16em] text-muted-foreground">Revision stage</p>
                    <p className="mt-1 text-sm text-foreground">
                      {project.currentRevisionStage || "No revision stage yet"}
                    </p>
                  </div>
                  {project.completedAt ? (
                    <div className="sm:col-span-2">
                      <p className="text-caption uppercase tracking-[0.16em] text-muted-foreground">Completed</p>
                      <p className="mt-1 text-sm font-medium text-emerald-700">
                        {formatPortalDateTime(project.completedAt)}
                      </p>
                    </div>
                  ) : null}
                </div>

                {session.data?.user?.role !== "sales_associate" ? (
                  <label className="mt-5 block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Update stage
                    </span>
                    <select
                      defaultValue={project.status}
                      onChange={(event) =>
                        updateProject.mutate({ projectId: project.id, status: event.target.value })
                      }
                      className={portalSelectClass}
                    >
                      {projectStatuses.map((status) => (
                        <option key={status} value={status}>
                          {formatPortalLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            );
          })}
          {!projects.data?.length ? (
            <p className="text-sm text-muted-foreground">No projects have been created from closed leads yet.</p>
          ) : null}
        </div>
      </PortalPanel>
    </div>
  );
}
