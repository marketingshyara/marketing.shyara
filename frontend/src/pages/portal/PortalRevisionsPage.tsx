import { usePortalSession } from "@/components/portal/PortalGuards";
import {
  PortalPageHeader,
  PortalPanel,
  PortalSectionHeading,
  PortalStatusBadge
} from "@/components/portal/portal-ui";
import {
  formatPortalDate,
  formatPortalLabel,
  portalButtonPrimaryClass,
  portalSelectClass,
  portalTextareaClass
} from "@/components/portal/portal-theme";
import { portalApi } from "@/lib/portal-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

const revisionStatuses = ["pending", "in_progress", "completed", "on_hold"];

export default function PortalRevisionsPage() {
  const queryClient = useQueryClient();
  const session = usePortalSession();
  const revisions = useQuery({ queryKey: ["portal-revisions"], queryFn: portalApi.revisions });
  const projects = useQuery({ queryKey: ["portal-projects"], queryFn: portalApi.projects });
  const leads = useQuery({ queryKey: ["portal-leads", "revisions-context"], queryFn: () => portalApi.leads() });
  const [projectId, setProjectId] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");

  const addRevision = useMutation({
    mutationFn: () =>
      portalApi.addRevision(projectId, {
        revisionNotes,
        requestedDate: new Date().toISOString().slice(0, 10),
        status: "pending"
      }),
    onSuccess: async () => {
      setRevisionNotes("");
      setProjectId("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["portal-revisions"] }),
        queryClient.invalidateQueries({ queryKey: ["portal-projects"] })
      ]);
    }
  });

  const updateRevision = useMutation({
    mutationFn: ({ revisionId, status }: { revisionId: string; status: string }) =>
      portalApi.updateRevision(revisionId, { status }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["portal-revisions"] }),
        queryClient.invalidateQueries({ queryKey: ["portal-projects"] })
      ]);
    }
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    addRevision.mutate();
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Revision Control"
        title="Manage revision rounds without losing delivery context"
        description="Revision requests and status updates now use the same standardized cards and fields as the rest of the portal."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {session.data?.user?.role !== "sales_associate" ? (
          <PortalPanel className="bg-[hsl(var(--surface))]">
            <PortalSectionHeading
              title="Create Revision Round"
              description="Open a new revision against an active delivery project."
            />
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Project
                </span>
                <select
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  className={portalSelectClass}
                >
                  <option value="">Select project</option>
                  {projects.data?.map((project) => {
                    const lead = leads.data?.find((entry) => entry.id === project.leadId);
                    return (
                      <option key={project.id} value={project.id}>
                        {(lead?.businessName ?? project.id) + " - " + formatPortalLabel(project.status)}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Revision notes
                </span>
                <textarea
                  value={revisionNotes}
                  onChange={(event) => setRevisionNotes(event.target.value)}
                  className={portalTextareaClass}
                />
              </label>
              <button type="submit" className={portalButtonPrimaryClass}>
                Add revision
              </button>
            </form>
          </PortalPanel>
        ) : (
          <PortalPanel className="bg-[hsl(var(--surface))]">
            <PortalSectionHeading
              title="Revision Access"
              description="Sales associates can monitor revisions here but only admin and operations can update them."
            />
          </PortalPanel>
        )}

        <PortalPanel>
          <PortalSectionHeading
            title="Revision Tracking"
            description="Track round numbers, request dates, and completion state."
          />
          <div className="portal-card-list mt-5">
            {revisions.data?.map((revision) => {
              const project = projects.data?.find((entry) => entry.id === revision.projectId);
              const lead = leads.data?.find((entry) => entry.id === project?.leadId);
              return (
                <div key={revision.id} className="portal-list-card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">Round {revision.roundNumber}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{lead?.businessName ?? revision.projectId}</p>
                      <p className="mt-3 text-sm leading-relaxed text-foreground">{revision.revisionNotes}</p>
                      <p className="mt-3 text-caption text-muted-foreground">
                        Requested {formatPortalDate(revision.requestedDate)}
                        {revision.completedDate ? ` - Completed ${formatPortalDate(revision.completedDate)}` : ""}
                      </p>
                    </div>
                    {session.data?.user?.role !== "sales_associate" ? (
                      <select
                        defaultValue={revision.status}
                        onChange={(event) =>
                          updateRevision.mutate({ revisionId: revision.id, status: event.target.value })
                        }
                        className={portalSelectClass}
                      >
                        {revisionStatuses.map((status) => (
                          <option key={status} value={status}>
                            {formatPortalLabel(status)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <PortalStatusBadge status={revision.status} />
                    )}
                  </div>
                </div>
              );
            })}
            {!revisions.data?.length ? <p className="text-sm text-muted-foreground">No revisions have been opened yet.</p> : null}
          </div>
        </PortalPanel>
      </section>
    </div>
  );
}
