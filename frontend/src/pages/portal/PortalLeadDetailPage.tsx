import { usePortalSession } from "@/components/portal/PortalGuards";
import {
  PortalPageHeader,
  PortalPanel,
  PortalSectionHeading,
  PortalStatusBadge
} from "@/components/portal/portal-ui";
import {
  formatPortalCurrency,
  formatPortalDate,
  formatPortalDateTime,
  formatPortalLabel,
  portalButtonPrimaryClass,
  portalButtonSecondaryClass,
  portalInputClass,
  portalSelectClass,
  portalTextareaClass
} from "@/components/portal/portal-theme";
import { portalApi } from "@/lib/portal-api";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const leadStatuses = [
  "new",
  "contacted",
  "under_follow_up",
  "interested",
  "not_interested",
  "callback_later",
  "payment_pending",
  "closed_won",
  "lost",
  "dormant"
];

const followUpTypes = ["call", "whatsapp", "email", "meeting", "callback", "payment_discussion", "other"];
const followUpOutcomes = [
  "follow_up_needed",
  "interested",
  "call_later",
  "payment_pending",
  "no_response",
  "not_interested"
];
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
    if (!detail.data) {
      return;
    }

    setStatus(detail.data.lead.status);
    setAssignTo(detail.data.lead.assignedSalesPersonId);
    setCloseForm((current) => ({
      ...current,
      packageName: detail.data.lead.packageInterest ?? ""
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
    return <PortalPanel>Loading lead...</PortalPanel>;
  }

  const operationsUsers = (users.data ?? []).filter((user) => user.role === "operations" && user.status === "active");
  const assigneeOptions = (users.data ?? []).filter((user) => user.role === "sales_associate" || user.role === "admin");

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Lead Detail"
        title={detail.data.lead.businessName}
        description={detail.data.lead.description || "This lead record tracks contact history, duplicate checks, project handoff, and commission context."}
        action={<PortalStatusBadge status={detail.data.lead.status} className="text-sm" />}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PortalPanel className="bg-[hsl(var(--surface))]">
          <p className="portal-eyebrow">Contact</p>
          <p className="mt-3 text-base font-semibold text-foreground">{detail.data.lead.contactPersonName}</p>
          <p className="mt-2 text-sm text-muted-foreground">{detail.data.lead.phoneNumber}</p>
          {detail.data.lead.email ? <p className="text-sm text-muted-foreground">{detail.data.lead.email}</p> : null}
        </PortalPanel>
        <PortalPanel className="bg-[hsl(var(--surface))]">
          <p className="portal-eyebrow">Location</p>
          <p className="mt-3 text-base font-semibold text-foreground">{detail.data.lead.city}</p>
          <p className="mt-2 text-sm text-muted-foreground">{detail.data.lead.locality || "No locality provided"}</p>
        </PortalPanel>
        <PortalPanel className="bg-[hsl(var(--surface))]">
          <p className="portal-eyebrow">Source</p>
          <p className="mt-3 text-base font-semibold text-foreground">{detail.data.lead.source || "Not recorded"}</p>
          <p className="mt-2 text-sm text-muted-foreground">{detail.data.lead.packageInterest || "No package mapped"}</p>
        </PortalPanel>
        <PortalPanel className="bg-[hsl(var(--surface))]">
          <p className="portal-eyebrow">Timeline</p>
          <p className="mt-3 text-base font-semibold text-foreground">{formatPortalDate(detail.data.lead.firstContactDate)}</p>
          <p className="mt-2 text-sm text-muted-foreground">Updated {formatPortalDateTime(detail.data.lead.updatedAt)}</p>
        </PortalPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <PortalPanel>
          <PortalSectionHeading
            title="Lead Actions"
            description="Update progress and ownership without leaving the record."
          />
          <div className="mt-5 space-y-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Update status
                </span>
                <select value={status} onChange={(event) => setStatus(event.target.value)} className={portalSelectClass}>
                  {leadStatuses.map((option) => (
                    <option key={option} value={option}>
                      {formatPortalLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <button type="button" onClick={() => updateStatus.mutate(status)} className={portalButtonPrimaryClass}>
                  Save status
                </button>
              </div>
            </div>

            {session.data?.user?.role === "admin" ? (
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Assign lead
                  </span>
                  <select value={assignTo} onChange={(event) => setAssignTo(event.target.value)} className={portalSelectClass}>
                    {assigneeOptions.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end">
                  <button type="button" onClick={() => assignLead.mutate()} className={portalButtonSecondaryClass}>
                    Reassign
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </PortalPanel>

        <PortalPanel className="bg-[hsl(var(--surface))]">
          <PortalSectionHeading
            title="Close / Won"
            description="Create the commission and operations handoff from the same workflow."
          />
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleCloseLead}>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Package name
              </span>
              <input
                value={closeForm.packageName}
                onChange={(event) => setCloseForm((current) => ({ ...current, packageName: event.target.value }))}
                className={portalInputClass}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Contract value
              </span>
              <input
                type="number"
                value={closeForm.closedValue}
                onChange={(event) => setCloseForm((current) => ({ ...current, closedValue: event.target.value }))}
                className={portalInputClass}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Commission override
              </span>
              <input
                type="number"
                value={closeForm.commissionAmount}
                onChange={(event) => setCloseForm((current) => ({ ...current, commissionAmount: event.target.value }))}
                className={portalInputClass}
              />
            </label>
            {session.data?.user?.role === "admin" ? (
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Operations owner
                </span>
                <select
                  value={closeForm.operationsOwnerUserId}
                  onChange={(event) =>
                    setCloseForm((current) => ({ ...current, operationsOwnerUserId: event.target.value }))
                  }
                  className={portalSelectClass}
                >
                  <option value="">Auto-assign operations owner</option>
                  {operationsUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Closure remarks
              </span>
              <textarea
                value={closeForm.remarks}
                onChange={(event) => setCloseForm((current) => ({ ...current, remarks: event.target.value }))}
                className={portalTextareaClass}
              />
            </label>
            <div className="md:col-span-2">
              <button type="submit" className={cn(portalButtonPrimaryClass, "w-full")}>
                Mark closed / won
              </button>
            </div>
          </form>
        </PortalPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <PortalPanel>
          <PortalSectionHeading
            title="Add Note"
            description="Capture objections, next steps, and internal reminders while the context is fresh."
          />
          <form className="mt-5 grid gap-4" onSubmit={handleAddNote}>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Discussion summary
              </span>
              <textarea
                value={noteForm.discussionSummary}
                onChange={(event) => setNoteForm((current) => ({ ...current, discussionSummary: event.target.value }))}
                className={portalTextareaClass}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Objections
              </span>
              <input
                value={noteForm.objections}
                onChange={(event) => setNoteForm((current) => ({ ...current, objections: event.target.value }))}
                className={portalInputClass}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Next steps
              </span>
              <input
                value={noteForm.nextSteps}
                onChange={(event) => setNoteForm((current) => ({ ...current, nextSteps: event.target.value }))}
                className={portalInputClass}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Promised follow-up
                </span>
                <input
                  value={noteForm.promisedFollowUp}
                  onChange={(event) =>
                    setNoteForm((current) => ({ ...current, promisedFollowUp: event.target.value }))
                  }
                  className={portalInputClass}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Internal reminder
                </span>
                <input
                  value={noteForm.internalReminder}
                  onChange={(event) =>
                    setNoteForm((current) => ({ ...current, internalReminder: event.target.value }))
                  }
                  className={portalInputClass}
                />
              </label>
            </div>
            <div>
              <button type="submit" className={portalButtonPrimaryClass}>
                Save note
              </button>
            </div>
          </form>
        </PortalPanel>

        <PortalPanel className="bg-[hsl(var(--surface))]">
          <PortalSectionHeading
            title="Add Follow-up"
            description="Log the latest outreach and define the next action."
          />
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleAddFollowUp}>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Follow-up note
              </span>
              <textarea
                value={followUpForm.note}
                onChange={(event) => setFollowUpForm((current) => ({ ...current, note: event.target.value }))}
                className={portalTextareaClass}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Follow-up type
              </span>
              <select
                value={followUpForm.followUpType}
                onChange={(event) =>
                  setFollowUpForm((current) => ({ ...current, followUpType: event.target.value }))
                }
                className={portalSelectClass}
              >
                {followUpTypes.map((option) => (
                  <option key={option} value={option}>
                    {formatPortalLabel(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Outcome
              </span>
              <select
                value={followUpForm.outcome}
                onChange={(event) => setFollowUpForm((current) => ({ ...current, outcome: event.target.value }))}
                className={portalSelectClass}
              >
                {followUpOutcomes.map((option) => (
                  <option key={option} value={option}>
                    {formatPortalLabel(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Next follow-up date
              </span>
              <input
                type="date"
                value={followUpForm.nextFollowUpDate}
                onChange={(event) =>
                  setFollowUpForm((current) => ({ ...current, nextFollowUpDate: event.target.value }))
                }
                className={portalInputClass}
              />
            </label>
            <div className="md:col-span-2">
              <button type="submit" className={portalButtonPrimaryClass}>
                Save follow-up
              </button>
            </div>
          </form>
        </PortalPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-4">
        <PortalPanel className="xl:col-span-2">
          <PortalSectionHeading title="Notes" description="Conversation history and internal context." />
          <div className="portal-card-list mt-5">
            {detail.data.notes.map((item) => (
              <div key={item.id} className="portal-list-card">
                <p className="text-sm leading-relaxed text-foreground">{item.discussionSummary}</p>
                {item.objections ? <p className="mt-3 text-sm text-muted-foreground">Objections: {item.objections}</p> : null}
                {item.nextSteps ? <p className="mt-1 text-sm text-muted-foreground">Next steps: {item.nextSteps}</p> : null}
                <p className="mt-3 text-caption text-muted-foreground">{formatPortalDateTime(item.createdAt)}</p>
              </div>
            ))}
            {!detail.data.notes.length ? <p className="text-sm text-muted-foreground">No notes yet.</p> : null}
          </div>
        </PortalPanel>

        <PortalPanel className="bg-[hsl(var(--surface))]">
          <PortalSectionHeading title="Follow-ups" description="Latest outreach and upcoming callbacks." />
          <div className="portal-card-list mt-5">
            {detail.data.followUps.map((item) => (
              <div key={item.id} className="portal-list-card">
                <p className="text-sm leading-relaxed text-foreground">{item.note}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {formatPortalLabel(item.followUpType)} - {formatPortalLabel(item.outcome)}
                </p>
                {item.nextFollowUpDate ? (
                  <p className="mt-2 text-caption text-muted-foreground">Next: {formatPortalDate(item.nextFollowUpDate)}</p>
                ) : null}
              </div>
            ))}
            {!detail.data.followUps.length ? <p className="text-sm text-muted-foreground">No follow-ups yet.</p> : null}
          </div>
        </PortalPanel>

        <PortalPanel className="bg-[hsl(var(--surface))]">
          <PortalSectionHeading title="Linked Outcomes" description="Downstream commercial and delivery impact." />
          <div className="mt-5 space-y-4">
            <div className="portal-list-card">
              <p className="portal-eyebrow text-[11px]">Commission</p>
              <p className="mt-2 text-sm text-foreground">
                {detail.data.commission
                  ? `${formatPortalLabel(detail.data.commission.status)} / ${formatPortalCurrency(detail.data.commission.commissionAmount)}`
                  : "Not created"}
              </p>
            </div>
            <div className="portal-list-card">
              <p className="portal-eyebrow text-[11px]">Project</p>
              <p className="mt-2 text-sm text-foreground">
                {detail.data.project ? formatPortalLabel(detail.data.project.status) : "Not started"}
              </p>
            </div>
            <div className="portal-list-card">
              <p className="portal-eyebrow text-[11px]">Revision rounds</p>
              <p className="mt-2 text-sm text-foreground">{detail.data.revisions.length}</p>
            </div>
            <div className="portal-list-card">
              <p className="portal-eyebrow text-[11px]">Duplicate flags</p>
              <p className="mt-2 text-sm text-foreground">{detail.data.duplicateFlags.length}</p>
            </div>
          </div>
        </PortalPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <PortalPanel>
          <PortalSectionHeading title="Duplicate Checks" description="Resolve conflicts before the lead progresses." />
          <div className="portal-card-list mt-5">
            {detail.data.duplicateFlags.map((flag) => (
              <div key={flag.id} className="portal-list-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{formatPortalLabel(flag.matchType)}</p>
                  <PortalStatusBadge status={flag.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Conflicting lead: {flag.conflictingLeadId}</p>
                {flag.status === "open" && session.data?.user?.role === "admin" ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      value={duplicateNotes[flag.id] ?? ""}
                      onChange={(event) =>
                        setDuplicateNotes((current) => ({ ...current, [flag.id]: event.target.value }))
                      }
                      placeholder="Resolution note"
                      className={portalInputClass}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        resolveDuplicate.mutate({ flagId: flag.id, note: duplicateNotes[flag.id] ?? "" })
                      }
                      className={portalButtonSecondaryClass}
                    >
                      Resolve
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            {!detail.data.duplicateFlags.length ? (
              <p className="text-sm text-muted-foreground">No duplicate conflicts on this lead.</p>
            ) : null}
          </div>
        </PortalPanel>

        <PortalPanel className="bg-[hsl(var(--surface))]">
          <PortalSectionHeading title="Activity Log" description="System events recorded on this lead and its handoffs." />
          <div className="portal-card-list mt-5">
            {detail.data.activityLog.map((entry) => (
              <div key={entry.id} className="portal-list-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{formatPortalLabel(entry.action)}</p>
                  {entry.createdAt ? (
                    <span className="text-caption text-muted-foreground">{formatPortalDateTime(entry.createdAt)}</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{entry.details ?? "No extra details"}</p>
              </div>
            ))}
            {!detail.data.activityLog.length ? <p className="text-sm text-muted-foreground">No logged activity yet.</p> : null}
          </div>
        </PortalPanel>
      </section>
    </div>
  );
}
