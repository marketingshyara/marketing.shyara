import type { QueryClient } from "@tanstack/react-query";
import { qk } from "../queryKeys";

export { applyLeadDetailToCache } from "./applyLeadDetailToCache";

export type InvalidateLeadScope = {
  leadId: string;
  repId?: string | null;
  /** Refetch rep pipeline list (active tab). */
  teamRepStatus?: "active" | "all" | "completed";
};

/** Scoped cache refresh after a single lead/project mutation. */
export function invalidateLeadAndRep(qc: QueryClient, scope: InvalidateLeadScope) {
  void qc.invalidateQueries({ queryKey: qk.lead(scope.leadId) });
  if (scope.repId) {
    const status = scope.teamRepStatus ?? "active";
    void qc.invalidateQueries({ queryKey: [...qk.teamRep(scope.repId), status] });
  }
  void qc.invalidateQueries({ queryKey: qk.teamReps });
}

export function invalidateAdminQueues(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: qk.pendingActionsCount });
  void qc.invalidateQueries({ queryKey: ["pending-actions"] });
  void qc.invalidateQueries({ queryKey: qk.pendingPaymentsCount });
  void qc.invalidateQueries({ queryKey: ["pending-payments"] });
}
