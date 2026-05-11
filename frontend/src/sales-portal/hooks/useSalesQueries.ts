import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "../api/client";
import { salesApi, type VerifyPaymentRequestBody } from "../api/salesApi";
import { qk } from "../queryKeys";
import type { LeadStatus, PortalSettingsValues, SessionUser } from "../types";

export function invalidateQueryPrefixes(qc: QueryClient, prefixes: readonly string[]) {
  for (const p of prefixes) {
    void qc.invalidateQueries({ queryKey: [p] });
  }
}

/** Query families to refresh after a lost CAS race (avoid nuking unrelated cache). */
const CONCURRENT_MODIFICATION_PREFIXES = [
  "leads",
  "lead",
  "commissions",
  "projects",
  "project",
  "users",
  "portal-settings",
  "admin-settings",
  "activity-logs",
  "pending-payments",
  "pending-payments-count",
  "session"
] as const;

export function errToast(e: unknown, qc?: QueryClient) {
  if (e instanceof ApiError) {
    if (qc && e.status === 409 && e.code === "CONCURRENT_MODIFICATION") {
      toast.error(e.message);
      invalidateQueryPrefixes(qc, [...CONCURRENT_MODIFICATION_PREFIXES]);
      return;
    }
    toast.error(e.message);
  } else toast.error("Something went wrong");
}

export function useSessionQuery() {
  return useQuery({
    queryKey: qk.session,
    queryFn: () => salesApi.session(),
    /** Session is validated on mutations and 401 handlers; avoid refetch-on-focus storms vs global defaults in `queryClient.ts`. */
    staleTime: 120_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  });
}

export function usePortalSettingsQuery(enabled = true) {
  return useQuery({
    queryKey: qk.settings,
    queryFn: () => salesApi.settings(),
    enabled,
    staleTime: 45_000
  });
}

export function useLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.login,
    meta: { skipAuthRedirect: true },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.session })
  });
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.logout,
    onSuccess: async () => {
      await qc.cancelQueries();
      qc.clear();
      qc.setQueryData(qk.session, { user: null });
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useChangePasswordMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.changePassword,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.session });
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useAdminSettingsQuery(enabled: boolean) {
  return useQuery({
    queryKey: qk.adminSettings,
    queryFn: () => salesApi.adminSettings(),
    enabled,
    staleTime: 45_000
  });
}

export function usePatchSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<PortalSettingsValues>) => salesApi.patchAdminSettings(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.adminSettings });
      qc.invalidateQueries({ queryKey: qk.settings });
      invalidateQueryPrefixes(qc, ["leads", "commissions", "activity-logs"]);
      toast.success("Settings saved");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useUsersQuery(page: number, pageSize: number, enabled: boolean) {
  return useQuery({
    queryKey: qk.users(page, pageSize),
    queryFn: () => salesApi.users({ page, pageSize }),
    enabled
  });
}

export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      invalidateQueryPrefixes(qc, ["activity-logs"]);
    },
    onError: (e) => errToast(e, qc)
  });
}

export function usePatchUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      salesApi.patchUser(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: qk.session });
      invalidateQueryPrefixes(qc, ["leads", "commissions", "activity-logs"]);
      toast.success("User updated");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useResetPasswordMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { temporaryPassword: string } }) =>
      salesApi.resetUserPassword(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      invalidateQueryPrefixes(qc, ["activity-logs"]);
      toast.success("Password reset; user must change password on next login.");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useLeadsQuery(params: {
  page: number;
  pageSize: number;
  status?: LeadStatus;
  search?: string;
  from?: Date;
  to?: Date;
  assignedToUserId?: string;
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = params;
  return useQuery({
    queryKey: qk.leads(rest),
    queryFn: () => salesApi.leads(rest),
    enabled
  });
}

export function useLeadQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: qk.lead(id ?? ""),
    queryFn: () => salesApi.lead(id!),
    enabled: !!id && enabled
  });
}

export function useCreateLeadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.createLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      void qc.invalidateQueries({ queryKey: ["team-reps"] });
      void qc.invalidateQueries({ queryKey: ["team-rep"] });
      invalidateQueryPrefixes(qc, ["commissions", "activity-logs"]);
      toast.success("Lead created");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function usePatchLeadMutation(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => salesApi.patchLead(leadId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.lead(leadId) });
      qc.invalidateQueries({ queryKey: ["leads"] });
      void qc.invalidateQueries({ queryKey: ["team-reps"] });
      void qc.invalidateQueries({ queryKey: ["team-rep"] });
      invalidateQueryPrefixes(qc, ["commissions", "activity-logs", "projects"]);
      toast.success("Lead updated");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useTransitionLeadMutation(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { toStatus: LeadStatus }) => salesApi.transitionLead(leadId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.lead(leadId) });
      qc.invalidateQueries({ queryKey: ["leads"] });
      invalidateQueryPrefixes(qc, ["commissions", "activity-logs", "projects"]);
      toast.success("Status updated");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useMarkPaymentMutation(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      kind: "ADVANCE" | "FINAL";
      amountCents: number;
      repNote?: string | null;
    }) => salesApi.markPayment(leadId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.lead(leadId) });
      qc.invalidateQueries({ queryKey: ["leads"] });
      void qc.invalidateQueries({ queryKey: ["team-reps"] });
      void qc.invalidateQueries({ queryKey: ["team-rep"] });
      invalidateQueryPrefixes(qc, [
        "commissions",
        "activity-logs",
        "pending-payments",
        "pending-payments-count"
      ]);
      toast.success("Payment marked");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useVerifyPaymentMutation(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, body }: { paymentId: string; body: VerifyPaymentRequestBody }) =>
      salesApi.verifyPayment(paymentId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.lead(leadId) });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["commissions"] });
      invalidateQueryPrefixes(qc, [
        "activity-logs",
        "pending-payments",
        "pending-payments-count",
        "projects"
      ]);
      toast.success("Verification saved");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useCommissionsQuery(params: {
  page: number;
  pageSize: number;
  isPaid?: boolean;
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = params;
  return useQuery({
    queryKey: qk.commissions(rest),
    queryFn: () => salesApi.commissions(rest),
    enabled
  });
}

export function usePatchCommissionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amountCents }: { id: string; amountCents: number }) =>
      salesApi.patchCommission(id, { amountCents }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commissions"] });
      qc.invalidateQueries({ queryKey: ["lead"] });
      invalidateQueryPrefixes(qc, ["leads", "activity-logs"]);
      toast.success("Commission updated");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useMarkCommissionPaidMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.markCommissionPaid,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commissions"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["lead"] });
      invalidateQueryPrefixes(qc, ["activity-logs"]);
      toast.success("Commission marked paid");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useProjectsQuery(page: number, pageSize: number, enabled = true) {
  return useQuery({
    queryKey: qk.projects(page, pageSize),
    queryFn: () => salesApi.projects({ page, pageSize }),
    enabled
  });
}

export function useProjectQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: qk.project(id ?? ""),
    queryFn: () => salesApi.project(id!),
    enabled: !!id && enabled
  });
}

export function useCreateProjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.createProject,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: qk.lead(data.project.leadId) });
      invalidateQueryPrefixes(qc, ["activity-logs"]);
      toast.success("Project created");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function usePatchProjectMutation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => salesApi.patchProject(projectId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.project(projectId) });
      qc.invalidateQueries({ queryKey: ["projects"] });
      invalidateQueryPrefixes(qc, ["leads", "lead", "activity-logs", "commissions"]);
      toast.success("Project updated");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useWebsiteTemplatesQuery(enabled = true) {
  return useQuery({
    queryKey: qk.websiteTemplates,
    queryFn: () => salesApi.websiteTemplates(),
    enabled,
    staleTime: 300_000
  });
}

export function useTeamRepsQuery(enabled: boolean) {
  return useQuery({
    queryKey: qk.teamReps,
    queryFn: () => salesApi.teamReps(),
    enabled,
    staleTime: 60_000
  });
}

export function useTeamRepQuery(userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: qk.teamRep(userId ?? ""),
    queryFn: () => salesApi.teamRep(userId!),
    enabled: !!userId && enabled,
    staleTime: 60_000
  });
}

export function useVerifyProjectDeploymentMutation(projectId: string | undefined, leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!projectId) throw new Error("Missing project id");
      return salesApi.verifyProjectDeployment(projectId);
    },
    onSuccess: () => {
      if (projectId) {
        qc.invalidateQueries({ queryKey: qk.project(projectId) });
      }
      qc.invalidateQueries({ queryKey: qk.lead(leadId) });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["commissions"] });
      void qc.invalidateQueries({ queryKey: ["team-reps"] });
      void qc.invalidateQueries({ queryKey: ["team-rep"] });
      invalidateQueryPrefixes(qc, ["activity-logs"]);
      toast.success("Deployment verified");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function usePendingPaymentsQuery(params: {
  page: number;
  pageSize: number;
  kind?: "ADVANCE" | "FINAL";
  assignedToUserId?: string;
  search?: string;
  from?: Date;
  to?: Date;
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = params;
  return useQuery({
    queryKey: qk.pendingPayments(rest),
    queryFn: () => salesApi.pendingPayments(rest),
    enabled
  });
}

export function usePendingPaymentsCountQuery(enabled: boolean) {
  return useQuery({
    queryKey: qk.pendingPaymentsCount,
    queryFn: () => salesApi.pendingPaymentsCount(),
    enabled
  });
}

export function useActivityLogsQuery(params: {
  page: number;
  pageSize: number;
  userId?: string;
  entityType?: string;
  entityId?: string;
  from?: Date;
  to?: Date;
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = params;
  return useQuery({
    queryKey: qk.activityLogs(rest),
    queryFn: () => salesApi.activityLogs(rest),
    enabled
  });
}

export function useExportMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.exportXlsx,
    onSuccess: () => toast.success("Download started"),
    onError: (e) => errToast(e, qc)
  });
}

export type SessionData = { user: SessionUser | null };
