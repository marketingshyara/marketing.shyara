import type { QueryClient } from "@tanstack/react-query";
import type { LeadDetailResponse } from "../types";
import { qk } from "../queryKeys";

/** Sync lead detail query immediately after a mutation returns LeadDetailResponse. */
export function applyLeadDetailToCache(
  qc: QueryClient,
  leadId: string,
  data: LeadDetailResponse
): void {
  qc.setQueryData(qk.lead(leadId), data);
}
