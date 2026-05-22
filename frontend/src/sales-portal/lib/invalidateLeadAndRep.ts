import type { QueryClient } from "@tanstack/react-query";
import type { TeamRepSummary } from "../types";
import { qk } from "../queryKeys";

export { applyLeadDetailToCache } from "./applyLeadDetailToCache";

export type TeamRepQueryData = {
  rep: TeamRepSummary;
  projects: { id: string }[];
};

export type InvalidateLeadScope = {
  leadId: string;
  repId?: string | null;
  /** @deprecated All team-rep tabs are invalidated when repId is set. */
  teamRepStatus?: "active" | "all" | "completed";
};

/** Scoped cache refresh after a single lead/project mutation. */
export function invalidateLeadAndRep(qc: QueryClient, scope: InvalidateLeadScope) {
  void qc.invalidateQueries({ queryKey: qk.lead(scope.leadId) });
  if (scope.repId) {
    void qc.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key[0] === "team-rep" && key[1] === scope.repId;
      }
    });
  }
  void qc.invalidateQueries({ queryKey: qk.teamReps });
}

/** Drop a settled project from the admin rep Active tab cache immediately after mark paid. */
export function removeLeadFromTeamRepActiveCache(
  qc: QueryClient,
  repId: string,
  leadId: string
): void {
  const cacheKey = [...qk.teamRep(repId), "active"] as const;
  qc.setQueryData<TeamRepQueryData>(cacheKey, (old) => {
    if (!old) return old;
    const projects = old.projects.filter((p) => p.id !== leadId);
    if (projects.length === old.projects.length) return old;
    return { ...old, projects };
  });
}

export function invalidateAdminQueues(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: qk.pendingActionsCount });
  void qc.invalidateQueries({ queryKey: ["pending-actions"] });
  void qc.invalidateQueries({ queryKey: qk.pendingPaymentsCount });
  void qc.invalidateQueries({ queryKey: ["pending-payments"] });
}
