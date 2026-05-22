import type { QueryClient } from "@tanstack/react-query";
import type { Commission, LeadDetailResponse } from "../types";
import { qk } from "../queryKeys";

/** Sync lead detail query immediately after a mutation returns LeadDetailResponse. */
export function applyLeadDetailToCache(
  qc: QueryClient,
  leadId: string,
  data: LeadDetailResponse & { commission?: Commission }
): void {
  const normalized: LeadDetailResponse = {
    lead: data.commission ? { ...data.lead, commission: data.commission } : data.lead,
    pipelineStages: data.pipelineStages
  };
  qc.setQueryData(qk.lead(leadId), normalized);
}
