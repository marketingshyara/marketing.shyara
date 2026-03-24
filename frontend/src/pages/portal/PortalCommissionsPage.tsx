import { portalApi } from "@/lib/portal-api";
import type { PortalCommission } from "@/types/portal";
import { usePortalSession } from "@/components/portal/PortalGuards";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

function buildDraft(commission: PortalCommission) {
  return {
    status: commission.status,
    remarks: commission.remarks ?? "",
    payoutDate: commission.payoutDate ?? "",
    rejectionReason: commission.rejectionReason ?? "",
    holdReason: commission.holdReason ?? ""
  };
}

export default function PortalCommissionsPage() {
  const queryClient = useQueryClient();
  const session = usePortalSession();
  const commissions = useQuery({ queryKey: ["portal-commissions"], queryFn: portalApi.commissions });
  const [drafts, setDrafts] = useState<Record<string, ReturnType<typeof buildDraft>>>({});

  const hydratedDrafts = useMemo(() => {
    const next = { ...drafts };
    for (const commission of commissions.data ?? []) {
      next[commission.id] ??= buildDraft(commission);
    }
    return next;
  }, [commissions.data, drafts]);

  const updateCommission = useMutation({
    mutationFn: ({ commissionId, payload }: { commissionId: string; payload: Record<string, unknown> }) =>
      portalApi.updateCommission(commissionId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portal-commissions"] });
    }
  });

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Commission Records</h2>
          <p className="mt-1 text-sm text-slate-400">Admin can approve, hold, reject, and mark payouts with full remarks.</p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {commissions.data?.map((commission) => {
          const draft = hydratedDrafts[commission.id];
          return (
            <div key={commission.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{commission.businessName}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Rs. {commission.commissionAmount} • Closed {new Date(commission.closureDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs">{commission.status.replaceAll("_", " ")}</span>
              </div>
              {session.data?.user?.role === "admin" ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <select
                    value={draft.status}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [commission.id]: { ...draft, status: event.target.value }
                      }))
                    }
                    className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                  >
                    {["pending", "under_review", "approved", "paid", "rejected", "on_hold"].map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={draft.payoutDate}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [commission.id]: { ...draft, payoutDate: event.target.value }
                      }))
                    }
                    className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                  />
                  <textarea
                    value={draft.remarks}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [commission.id]: { ...draft, remarks: event.target.value }
                      }))
                    }
                    placeholder="General remarks"
                    className="min-h-24 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                  />
                  <div className="grid gap-3">
                    <input
                      value={draft.rejectionReason}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [commission.id]: { ...draft, rejectionReason: event.target.value }
                        }))
                      }
                      placeholder="Rejection reason"
                      className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                    />
                    <input
                      value={draft.holdReason}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [commission.id]: { ...draft, holdReason: event.target.value }
                        }))
                      }
                      placeholder="Hold reason"
                      className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        updateCommission.mutate({
                          commissionId: commission.id,
                          payload: {
                            status: draft.status,
                            remarks: draft.remarks || undefined,
                            payoutDate: draft.payoutDate || undefined,
                            rejectionReason: draft.rejectionReason || undefined,
                            holdReason: draft.holdReason || undefined
                          }
                        })
                      }
                      className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950"
                    >
                      Save commission update
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  {commission.remarks ? <p>Remarks: {commission.remarks}</p> : null}
                  {commission.payoutDate ? <p>Payout date: {commission.payoutDate}</p> : null}
                  {commission.rejectionReason ? <p>Rejected: {commission.rejectionReason}</p> : null}
                  {commission.holdReason ? <p>On hold: {commission.holdReason}</p> : null}
                </div>
              )}
            </div>
          );
        })}
        {!commissions.data?.length ? <p className="text-sm text-slate-400">No commissions recorded yet.</p> : null}
      </div>
    </section>
  );
}
