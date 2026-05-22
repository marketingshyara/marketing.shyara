import type { QueryClient } from "@tanstack/react-query";
import type { Commission, LeadDetailResponse } from "../types";
import { qk } from "../queryKeys";

type LeadDetailCacheInput = LeadDetailResponse & {
  commission?: Commission;
  payment?: { id: string } & Record<string, unknown>;
};

/** Sync lead detail query immediately after a mutation returns LeadDetailResponse. */
export function applyLeadDetailToCache(
  qc: QueryClient,
  leadId: string,
  data: LeadDetailCacheInput
): void {
  const existing = qc.getQueryData<LeadDetailResponse>(qk.lead(leadId));
  let lead = data.commission ? { ...data.lead, commission: data.commission } : data.lead;

  if (data.payment && existing?.lead.payments) {
    const payments = existing.lead.payments.map((p) =>
      p.id === data.payment!.id ? { ...p, ...data.payment } : p
    );
    if (!payments.some((p) => p.id === data.payment!.id)) {
      payments.unshift(data.payment as (typeof payments)[number]);
    }
    lead = { ...lead, payments };
  }

  const normalized: LeadDetailResponse = {
    lead,
    pipelineStages: data.pipelineStages ?? existing?.pipelineStages ?? []
  };
  qc.setQueryData(qk.lead(leadId), normalized);
}
