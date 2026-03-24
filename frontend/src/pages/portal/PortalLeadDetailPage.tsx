import { usePortalSession } from "@/components/portal/PortalGuards";
import { portalApi } from "@/lib/portal-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PortalLeadDetailPage() {
  const queryClient = useQueryClient();
  const { leadId = "" } = useParams();
  const session = usePortalSession();
  const detail = useQuery({
    queryKey: ["portal-lead", leadId],
    queryFn: () => portalApi.leadDetail(leadId),
    enabled: Boolean(leadId)
  });
  const users = useQuery({
    queryKey: ["portal-users"],
    queryFn: portalApi.users,
    enabled: session.data?.user?.role === "admin"
  });

  const [status, setStatus] = useState("interested");
  const [assignTo, setAssignTo] = useState("");
  const [duplicateNotes, setDuplicateNotes] = useState<Record<string, string>>({});
  const [noteForm, setNoteForm] = useState({
    discussionSummary: "",
    objections: "",
    nextSteps: "",
    promisedFollowUp: "",
    internalReminder: ""
  });
  const [followUpForm, setFollowUpForm] = useState({
    note: "",
    nextFollowUpDate: new Date().toISOString().slice(0, 10),
    followUpType: "call",
    outcome: "follow_up_needed"
  });
  const [closeForm, setCloseForm] = useState({
    packageName: "",
    closedValue: "",
    commissionAmount: "",
    remarks: "",
    operationsOwnerUserId: ""
  });

  useEffect(() => {
    if (!detail.data) return;
    setStatus(detail.data.lead.status);
    setAssignTo(detail.data.lead.assignedSalesPersonId);
    setCloseForm((current) => ({
      ...current,
      packageName: detail.data?.lead.packageInterest ?? "",
      operationsOwnerUserId: detail.data?.project?.id ? current.operationsOwnerUserId : current.operationsOwnerUserId
    }));
  }, [detail.data]);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["portal-lead", leadId] }),
      queryClient.invalidateQueries({ queryKey: ["portal-leads"] }),
      queryClient.invalidateQueries({ queryKey: ["portal-projects"] }),
      queryClient.invalidateQueries({ queryKey: ["portal-commissions"] }),
      queryClient.invalidateQueries({ queryKey: ["portal-revisions"] }),
      queryClient.invalidateQueries({ queryKey: ["portal-dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["portal-notifications"] })
    ]);
  };

  const updateStatus = useMutation({
    mutationFn: (nextStatus: string) => portalApi.updateLeadStatus(leadId, nextStatus),
    onSuccess: invalidate
  });
  const addNote = useMutation({
    mutationFn: () => portalApi.addLeadNote(leadId, noteForm),
    onSuccess: async () => {
      setNoteForm({
        discussionSummary: "",
        objections: "",
        nextSteps: "",
        promisedFollowUp: "",
        internalReminder: ""
      });
      await invalidate();
    }
  });
  const addFollowUp = useMutation({
    mutationFn: () =>
      portalApi.addFollowUp(leadId, {
        dateTime: new Date().toISOString(),
        followUpType: followUpForm.followUpType,
        note: followUpForm.note,
        nextFollowUpDate: followUpForm.nextFollowUpDate,
        outcome: followUpForm.outcome
      }),
    onSuccess: async () => {
      setFollowUpForm({
        note: "",
        nextFollowUpDate: new Date().toISOString().slice(0, 10),
        followUpType: "call",
        outcome: "follow_up_needed"
      });
      await invalidate();
    }
  });
  const assignLead = useMutation({
    mutationFn: () => portalApi.assignLead(leadId, { toUserId: assignTo, sharedWithUserIds: [] }),
    onSuccess: invalidate
  });
  const resolveDuplicate = useMutation({
    mutationFn: ({ flagId, note }: { flagId: string; note: string }) => portalApi.resolveDuplicate(flagId, note),
    onSuccess: invalidate
  });
  const closeLead = useMutation({
    mutationFn: () =>
      portalApi.closeLead(leadId, {
        packageName: closeForm.packageName,
        closedValue: Number(closeForm.closedValue),
        commissionAmount: closeForm.commissionAmount ? Number(closeForm.commissionAmount) : undefined,
        remarks: closeForm.remarks || undefined,
        operationsOwnerUserId: closeForm.operationsOwnerUserId || undefined
      }),
    onSuccess: invalidate
  });

  const handleAddNote = (event: FormEvent) => {
    event.preventDefault();
    addNote.mutate();
  };

  const handleAddFollowUp = (event: FormEvent) => {
    event.preventDefault();
    addFollowUp.mutate();
  };

  const handleCloseLead = (event: FormEvent) => {
    event.preventDefault();
    closeLead.mutate();
  };

  if (!detail.data) {
    return <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">Loading lead...</div>;
  }

  const operationsUsers = (users.data ?? []).filter((user) => user.role === "operations" && user.status === "active");
  const assigneeOptions = (users.data ?? []).filter((user) => user.role === "sales_associate" || user.role === "admin");

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Lead Detail</p>
            <h2 className="mt-2 text-3xl font-semibold">{detail.data.lead.businessName}</h2>
            <p className="mt-2 text-sm text-slate-300">{detail.data.lead.description}</p>
          </div>
          <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">
            {detail.data.lead.status.replaceAll("_", " ")}
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Contact</p>
            <p className="mt-2">{detail.data.lead.contactPersonName}</p>
            <p className="text-sm text-slate-400">{detail.data.lead.phoneNumber}</p>
            <p className="text-sm text-slate-400">{detail.data.lead.email}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Location</p>
            <p className="mt-2">{detail.data.lead.city}</p>
            <p className="text-sm text-slate-400">{detail.data.lead.locality}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Source</p>
            <p className="mt-2">{detail.data.lead.source}</p>
            <p className="text-sm text-slate-400">{detail.data.lead.packageInterest}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Timeline</p>
            <p className="mt-2">{detail.data.lead.firstContactDate}</p>
            <p className="text-sm text-slate-400">{new Date(detail.data.lead.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Lead Actions</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Update status</label>
              <div className="flex gap-3">
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="flex-1 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                  {["new", "contacted", "under_follow_up", "interested", "not_interested", "callback_later", "payment_pending", "closed_won", "lost", "dormant"].map((option) => (
                    <option key={option} value={option}>
                      {option.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => updateStatus.mutate(status)} className="rounded-full bg-cyan-400 px-4 py-2 font-medium text-slate-950">
                  Save
                </button>
              </div>
            </div>
            {session.data?.user?.role === "admin" ? (
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Assign lead</label>
                <div className="flex gap-3">
                  <select value={assignTo} onChange={(event) => setAssignTo(event.target.value)} className="flex-1 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                    {assigneeOptions.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => assignLead.mutate()} className="rounded-full border border-white/10 px-4 py-2 text-sm">
                    Reassign
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <form className="rounded-[28px] border border-white/10 bg-white/5 p-6" onSubmit={handleCloseLead}>
          <h3 className="text-lg font-semibold">Close / Won</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={closeForm.packageName}
              onChange={(event) => setCloseForm((current) => ({ ...current, packageName: event.target.value }))}
              placeholder="Package name"
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
            <input
              type="number"
              value={closeForm.closedValue}
              onChange={(event) => setCloseForm((current) => ({ ...current, closedValue: event.target.value }))}
              placeholder="Contract value"
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
            <input
              type="number"
              value={closeForm.commissionAmount}
              onChange={(event) => setCloseForm((current) => ({ ...current, commissionAmount: event.target.value }))}
              placeholder="Commission override (optional)"
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
            {session.data?.user?.role === "admin" ? (
              <select
                value={closeForm.operationsOwnerUserId}
                onChange={(event) => setCloseForm((current) => ({ ...current, operationsOwnerUserId: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
              >
                <option value="">Auto-assign operations owner</option>
                {operationsUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            ) : null}
            <textarea
              value={closeForm.remarks}
              onChange={(event) => setCloseForm((current) => ({ ...current, remarks: event.target.value }))}
              placeholder="Closure remarks"
              className="min-h-24 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 md:col-span-2"
            />
          </div>
          <button type="submit" className="mt-4 w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950">
            Mark Closed / Won
          </button>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <form className="rounded-[28px] border border-white/10 bg-white/5 p-6" onSubmit={handleAddNote}>
          <h3 className="text-lg font-semibold">Add Note</h3>
          <div className="mt-4 grid gap-3">
            <textarea
              value={noteForm.discussionSummary}
              onChange={(event) => setNoteForm((current) => ({ ...current, discussionSummary: event.target.value }))}
              placeholder="Discussion summary"
              className="min-h-24 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
            <input
              value={noteForm.objections}
              onChange={(event) => setNoteForm((current) => ({ ...current, objections: event.target.value }))}
              placeholder="Objections"
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
            <input
              value={noteForm.nextSteps}
              onChange={(event) => setNoteForm((current) => ({ ...current, nextSteps: event.target.value }))}
              placeholder="Next steps"
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
            <input
              value={noteForm.promisedFollowUp}
              onChange={(event) => setNoteForm((current) => ({ ...current, promisedFollowUp: event.target.value }))}
              placeholder="Promised follow-up"
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
            <input
              value={noteForm.internalReminder}
              onChange={(event) => setNoteForm((current) => ({ ...current, internalReminder: event.target.value }))}
              placeholder="Internal reminder"
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            />
          </div>
          <button type="submit" className="mt-4 rounded-full bg-cyan-400 px-4 py-2 font-medium text-slate-950">
            Save note
          </button>
        </form>

        <form className="rounded-[28px] border border-white/10 bg-white/5 p-6" onSubmit={handleAddFollowUp}>
          <h3 className="text-lg font-semibold">Add Follow-up</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <textarea
              value={followUpForm.note}
              onChange={(event) => setFollowUpForm((current) => ({ ...current, note: event.target.value }))}
              placeholder="Follow-up note"
              className="min-h-24 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 md:col-span-2"
            />
            <select
              value={followUpForm.followUpType}
              onChange={(event) => setFollowUpForm((current) => ({ ...current, followUpType: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            >
              {["call", "whatsapp", "email", "meeting", "callback", "payment_discussion", "other"].map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <select
              value={followUpForm.outcome}
              onChange={(event) => setFollowUpForm((current) => ({ ...current, outcome: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
            >
              {["follow_up_needed", "interested", "call_later", "payment_pending", "no_response", "not_interested"].map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={followUpForm.nextFollowUpDate}
              onChange={(event) => setFollowUpForm((current) => ({ ...current, nextFollowUpDate: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 md:col-span-2"
            />
          </div>
          <button type="submit" className="mt-4 rounded-full bg-cyan-400 px-4 py-2 font-medium text-slate-950">
            Save follow-up
          </button>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-4">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 xl:col-span-2">
          <h3 className="text-lg font-semibold">Notes</h3>
          <div className="mt-4 space-y-3">
            {detail.data.notes.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p>{item.discussionSummary}</p>
                {item.objections ? <p className="mt-2 text-sm text-slate-400">Objections: {item.objections}</p> : null}
                {item.nextSteps ? <p className="mt-1 text-sm text-slate-400">Next steps: {item.nextSteps}</p> : null}
                <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {!detail.data.notes.length ? <p className="text-sm text-slate-400">No notes yet.</p> : null}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Follow-ups</h3>
          <div className="mt-4 space-y-3">
            {detail.data.followUps.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p>{item.note}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {item.followUpType.replaceAll("_", " ")} • {item.outcome.replaceAll("_", " ")}
                </p>
                {item.nextFollowUpDate ? <p className="mt-1 text-xs text-slate-500">Next: {item.nextFollowUpDate}</p> : null}
              </div>
            ))}
            {!detail.data.followUps.length ? <p className="text-sm text-slate-400">No follow-ups yet.</p> : null}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Linked Outcomes</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>Commission: {detail.data.commission ? `${detail.data.commission.status} / Rs. ${detail.data.commission.commissionAmount}` : "Not created"}</p>
            <p>Project: {detail.data.project ? detail.data.project.status.replaceAll("_", " ") : "Not started"}</p>
            <p>Revisions: {detail.data.revisions.length}</p>
            <p>Duplicate flags: {detail.data.duplicateFlags.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Duplicate Checks</h3>
          <div className="mt-4 space-y-3">
            {detail.data.duplicateFlags.map((flag) => (
              <div key={flag.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="font-medium">{flag.matchType.replaceAll("_", " ")}</p>
                <p className="mt-1 text-sm text-slate-400">Conflicting lead: {flag.conflictingLeadId}</p>
                <p className="mt-1 text-xs text-slate-500">Status: {flag.status}</p>
                {flag.status === "open" && session.data?.user?.role === "admin" ? (
                  <div className="mt-3 flex gap-3">
                    <input
                      value={duplicateNotes[flag.id] ?? ""}
                      onChange={(event) => setDuplicateNotes((current) => ({ ...current, [flag.id]: event.target.value }))}
                      placeholder="Resolution note"
                      className="flex-1 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => resolveDuplicate.mutate({ flagId: flag.id, note: duplicateNotes[flag.id] ?? "" })}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm"
                    >
                      Resolve
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            {!detail.data.duplicateFlags.length ? <p className="text-sm text-slate-400">No duplicate conflicts on this lead.</p> : null}
          </div>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Activity Log</h3>
          <div className="mt-4 space-y-3">
            {detail.data.activityLog.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="font-medium">{entry.action.replaceAll("_", " ")}</p>
                <p className="mt-1 text-sm text-slate-400">{entry.details ?? "No extra details"}</p>
              </div>
            ))}
            {!detail.data.activityLog.length ? <p className="text-sm text-slate-400">No logged activity yet.</p> : null}
          </div>
        </section>
      </section>
    </div>
  );
}
