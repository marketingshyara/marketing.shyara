import { usePortalSession } from "@/components/portal/PortalGuards";
import { portalApi } from "@/lib/portal-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold">Closed Lead Project Tracking</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {projects.data?.map((project) => {
          const lead = leads.data?.find((entry) => entry.id === project.leadId);
          return (
            <div key={project.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="font-medium">{lead?.businessName ?? project.leadId}</p>
              <p className="mt-1 text-sm text-slate-400">{lead?.contactPersonName ?? "Lead context unavailable"}</p>
              <p className="mt-2 text-sm text-slate-300">{project.status.replaceAll("_", " ")}</p>
              <p className="mt-1 text-xs text-slate-500">Started {new Date(project.startedAt).toLocaleString()}</p>
              {project.currentRevisionStage ? <p className="mt-1 text-xs text-slate-500">Revision stage: {project.currentRevisionStage}</p> : null}
              {project.completedAt ? <p className="mt-1 text-xs text-emerald-300">Completed {new Date(project.completedAt).toLocaleString()}</p> : null}
              {session.data?.user?.role !== "sales_associate" ? (
                <select
                  defaultValue={project.status}
                  onChange={(event) => updateProject.mutate({ projectId: project.id, status: event.target.value })}
                  className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                >
                  {["project_started", "content_pending", "in_progress", "preview_shared", "revision_pending", "revision_in_progress", "final_delivery_done", "closed"].map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          );
        })}
        {!projects.data?.length ? <p className="text-sm text-slate-400">No projects have been created from closed leads yet.</p> : null}
      </div>
    </section>
  );
}
