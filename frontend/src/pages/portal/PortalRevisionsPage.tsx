import { usePortalSession } from "@/components/portal/PortalGuards";
import { portalApi } from "@/lib/portal-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

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
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      {session.data?.user?.role !== "sales_associate" ? (
        <form className="rounded-[28px] border border-white/10 bg-white/5 p-6" onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold">Create Revision Round</h2>
          <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
            <option value="">Select project</option>
            {projects.data?.map((project) => {
              const lead = leads.data?.find((entry) => entry.id === project.leadId);
              return (
                <option key={project.id} value={project.id}>
                  {(lead?.businessName ?? project.id) + " • " + project.status}
                </option>
              );
            })}
          </select>
          <textarea value={revisionNotes} onChange={(event) => setRevisionNotes(event.target.value)} className="mt-4 min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3" />
          <button type="submit" className="mt-4 rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950">
            Add revision
          </button>
        </form>
      ) : (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          Sales associates can monitor revisions here but only admin and operations can update them.
        </div>
      )}
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Revision Tracking</h2>
        <div className="mt-4 space-y-3">
          {revisions.data?.map((revision) => {
            const project = projects.data?.find((entry) => entry.id === revision.projectId);
            const lead = leads.data?.find((entry) => entry.id === project?.leadId);
            return (
              <div key={revision.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Round {revision.roundNumber}</p>
                    <p className="mt-1 text-sm text-slate-300">{lead?.businessName ?? revision.projectId}</p>
                    <p className="mt-1 text-sm text-slate-400">{revision.revisionNotes}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Requested {revision.requestedDate}
                      {revision.completedDate ? ` • Completed ${revision.completedDate}` : ""}
                    </p>
                  </div>
                  {session.data?.user?.role !== "sales_associate" ? (
                    <select
                      defaultValue={revision.status}
                      onChange={(event) => updateRevision.mutate({ revisionId: revision.id, status: event.target.value })}
                      className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                    >
                      {["pending", "in_progress", "completed", "on_hold"].map((status) => (
                        <option key={status} value={status}>
                          {status.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs">{revision.status.replaceAll("_", " ")}</span>
                  )}
                </div>
              </div>
            );
          })}
          {!revisions.data?.length ? <p className="text-sm text-slate-400">No revisions have been opened yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
