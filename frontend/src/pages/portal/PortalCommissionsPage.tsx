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
  formatPortalLabel,
  portalButtonPrimaryClass,
  portalInputClass,
  portalSelectClass,
  portalTextareaClass
} from "@/components/portal/portal-theme";
import { portalApi } from "@/lib/portal-api";
import type { PortalCommission } from "@/types/portal";
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
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Commissions"
        title="Track approvals, holds, rejections, and payouts"
        description="Commission records now use the same softer surfaces and clearer contrast as the rest of the Shyara interface, while keeping approval work dense enough for admin reviews."
      />

      <PortalPanel>
        <PortalSectionHeading
          title="Commission Records"
          description="Admin can approve, hold, reject, and mark payouts with full remarks."
        />
        <div className="portal-card-list mt-5">
          {commissions.data?.map((commission) => {
            const draft = hydratedDrafts[commission.id];
            return (
              <div key={commission.id} className="portal-list-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{commission.businessName}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatPortalCurrency(commission.commissionAmount)} - Closed {formatPortalDate(commission.closureDate)}
                    </p>
                  </div>
                  <PortalStatusBadge status={commission.status} />
                </div>

                {session.data?.user?.role === "admin" ? (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Status
                      </span>
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [commission.id]: { ...draft, status: event.target.value }
                          }))
                        }
                        className={portalSelectClass}
                      >
                        {["pending", "under_review", "approved", "paid", "rejected", "on_hold"].map((status) => (
                          <option key={status} value={status}>
                            {formatPortalLabel(status)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Payout date
                      </span>
                      <input
                        type="date"
                        value={draft.payoutDate}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [commission.id]: { ...draft, payoutDate: event.target.value }
                          }))
                        }
                        className={portalInputClass}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        General remarks
                      </span>
                      <textarea
                        value={draft.remarks}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [commission.id]: { ...draft, remarks: event.target.value }
                          }))
                        }
                        className={portalTextareaClass}
                      />
                    </label>

                    <div className="grid gap-4">
                      <label className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Rejection reason
                        </span>
                        <input
                          value={draft.rejectionReason}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [commission.id]: { ...draft, rejectionReason: event.target.value }
                            }))
                          }
                          className={portalInputClass}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Hold reason
                        </span>
                        <input
                          value={draft.holdReason}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [commission.id]: { ...draft, holdReason: event.target.value }
                            }))
                          }
                          className={portalInputClass}
                        />
                      </label>
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
                        className={portalButtonPrimaryClass}
                      >
                        Save commission update
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {commission.remarks ? (
                      <div className="portal-list-card">
                        <p className="portal-eyebrow text-[11px]">Remarks</p>
                        <p className="mt-2 text-sm text-foreground">{commission.remarks}</p>
                      </div>
                    ) : null}
                    {commission.payoutDate ? (
                      <div className="portal-list-card">
                        <p className="portal-eyebrow text-[11px]">Payout date</p>
                        <p className="mt-2 text-sm text-foreground">{formatPortalDate(commission.payoutDate)}</p>
                      </div>
                    ) : null}
                    {commission.rejectionReason ? (
                      <div className="portal-list-card">
                        <p className="portal-eyebrow text-[11px]">Rejected</p>
                        <p className="mt-2 text-sm text-foreground">{commission.rejectionReason}</p>
                      </div>
                    ) : null}
                    {commission.holdReason ? (
                      <div className="portal-list-card">
                        <p className="portal-eyebrow text-[11px]">On hold</p>
                        <p className="mt-2 text-sm text-foreground">{commission.holdReason}</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
          {!commissions.data?.length ? <p className="text-sm text-muted-foreground">No commissions recorded yet.</p> : null}
        </div>
      </PortalPanel>
    </div>
  );
}
