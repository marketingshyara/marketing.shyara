import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "../api/client";
import { salesApi, type VerifyPaymentRequestBody } from "../api/salesApi";
import { qk } from "../queryKeys";
import { applyLeadDetailToCache } from "../lib/applyLeadDetailToCache";
import {
  invalidateAdminQueues,
  invalidateLeadAndRep,
  removeLeadFromTeamRepActiveCache
} from "../lib/invalidateLeadAndRep";
import type {
  LeadStatus,
  PipelineStageVerifyKey,
  PortalSettingsValues,
  PaymentShareMethodKey,
  SessionUser
} from "../types";

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
  "pending-actions",
  "pending-actions-count",
  "notifications",
  "notifications-unread-count",
  "session"
] as const;

export function errToast(e: unknown, qc?: QueryClient) {
  if (e instanceof ApiError) {
    if (qc && e.status === 409 && e.code === "CONCURRENT_MODIFICATION") {
      toast.error(e.message);
      invalidateQueryPrefixes(qc, [...CONCURRENT_MODIFICATION_PREFIXES]);
      return;
    }
    if (e.code === "EMAIL_IN_USE") {
      toast.error(
        "That email is already registered. Refresh the users list — the account may already exist."
      );
      return;
    }
    if (e.code === "VALIDATION_ERROR") {
      toast.error("Enter a valid link (e.g. https://example.com or example.com).");
      return;
    }
    if (e.code === "INVALID_STATE") {
      toast.error(e.message || "This action is not available for this project yet.");
      return;
    }
    if (e.code === "LEAD_TERMINAL") {
      toast.error(e.message || "This project is complete and cannot be changed.");
      return;
    }
    if (e.code === "INVALID_TRANSITION") {
      toast.error(e.message || "This status change is not allowed.");
      return;
    }
    if (e.code === "PENDING_PAYMENT") {
      toast.error(e.message || "A payment is already waiting for admin approval.");
      return;
    }
    if (e.code === "PAYMENT_AMOUNT_MISMATCH") {
      toast.error(
        e.message || "Payment amount no longer matches the deal. Refresh the page and try again."
      );
      if (qc) invalidateQueryPrefixes(qc, ["lead", "leads"]);
      return;
    }
    if (e.code === "ALREADY_PROCESSED") {
      toast.error(e.message || "This step was already completed. Refresh and check the pipeline.");
      return;
    }
    if (e.code === "ALREADY_PAID") {
      toast.error(e.message || "Commission is already marked paid.");
      return;
    }
    toast.error(e.message);
  } else if (e instanceof Error && e.message) {
    toast.error(e.message);
  } else toast.error("Something went wrong");
}

export function useSessionQuery() {
  return useQuery({
    queryKey: qk.session,
    queryFn: () => salesApi.session(),
    /** Longer stale window; gentle refetch on tab focus revalidates auth without data-query storms. */
    staleTime: 120_000,
    refetchOnWindowFocus: true,
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
    onSuccess: (data) => {
      qc.setQueryData(qk.session, data);
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
  view?: "leads" | "clients" | "completed";
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

export function usePatchLeadMutation(leadId: string, repId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => salesApi.patchLead(leadId, body),
    onSuccess: (data, _vars, _ctx, context) => {
      applyLeadDetailToCache(qc, leadId, data);
      invalidateLeadAndRep(qc, {
        leadId,
        repId: repId ?? data.lead.assignedToUserId
      });
      qc.invalidateQueries({ queryKey: ["leads"] });
      invalidateAdminQueues(qc);
      invalidateQueryPrefixes(qc, ["commissions", "activity-logs", "projects"]);
      void qc.invalidateQueries({ queryKey: qk.notificationsUnreadCount });
      const meta = context?.meta as { skipSuccessToast?: boolean } | undefined;
      if (!meta?.skipSuccessToast) toast.success("Saved");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useConvertLeadMutation(leadId: string, repId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      websiteTemplateId: string;
      agreedTotalCents: number;
      repNote: PaymentShareMethodKey;
    }) => salesApi.convertLead(leadId, body),
    onSuccess: (data) => {
      invalidateLeadAndRep(qc, {
        leadId,
        repId: repId ?? data.lead.assignedToUserId
      });
      qc.invalidateQueries({ queryKey: ["leads"] });
      invalidateAdminQueues(qc);
      invalidateQueryPrefixes(qc, ["activity-logs"]);
      toast.success("Submitted for admin approval");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useVerifyLeadStageMutation(leadId: string, repId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      arg:
        | PipelineStageVerifyKey
        | { stageKey: PipelineStageVerifyKey; body?: Record<string, unknown> }
    ) => {
      const stageKey = typeof arg === "string" ? arg : arg.stageKey;
      const body = typeof arg === "string" ? undefined : arg.body;
      return salesApi.verifyLeadStage(leadId, stageKey, body);
    },
    onSuccess: (data, _vars, _ctx, context) => {
      applyLeadDetailToCache(qc, leadId, data);
      invalidateLeadAndRep(qc, {
        leadId,
        repId: repId ?? data.lead.assignedToUserId
      });
      qc.invalidateQueries({ queryKey: ["leads"] });
      invalidateAdminQueues(qc);
      invalidateQueryPrefixes(qc, ["commissions", "activity-logs"]);
      void qc.invalidateQueries({ queryKey: qk.notificationsUnreadCount });
      const meta = context?.meta as { skipSuccessToast?: boolean } | undefined;
      if (!meta?.skipSuccessToast) toast.success("Stage verified");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useRejectLeadStageMutation(leadId: string, repId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      stageKey,
      adminNote
    }: {
      stageKey: PipelineStageVerifyKey;
      adminNote?: string | null;
    }) => salesApi.rejectLeadStage(leadId, stageKey, { adminNote }),
    onSuccess: (data) => {
      applyLeadDetailToCache(qc, leadId, data);
      invalidateLeadAndRep(qc, {
        leadId,
        repId: repId ?? data.lead.assignedToUserId
      });
      qc.invalidateQueries({ queryKey: ["leads"] });
      invalidateAdminQueues(qc);
      void qc.invalidateQueries({ queryKey: qk.notificationsUnreadCount });
      toast.success("Declined — rep can resubmit");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useMarkPaymentMutation(leadId: string, repId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      kind: "ADVANCE" | "FINAL";
      amountCents: number;
      repNote: PaymentShareMethodKey;
    }) => salesApi.markPayment(leadId, body),
    onSuccess: () => {
      invalidateLeadAndRep(qc, { leadId, repId: repId ?? undefined });
      qc.invalidateQueries({ queryKey: ["leads"] });
      invalidateAdminQueues(qc);
      invalidateQueryPrefixes(qc, ["commissions", "activity-logs"]);
      toast.success("Payment marked");
    },
    onError: (e) => errToast(e, qc)
  });
}

export function useVerifyPaymentMutation(leadId: string, repId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, body }: { paymentId: string; body: VerifyPaymentRequestBody }) =>
      salesApi.verifyPayment(paymentId, body),
    onSuccess: (data, variables) => {
      applyLeadDetailToCache(qc, leadId, {
        lead: data.lead,
        pipelineStages: data.pipelineStages,
        payment: data.payment
      });
      invalidateLeadAndRep(qc, {
        leadId,
        repId: repId ?? data.lead.assignedToUserId
      });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["commissions"] });
      invalidateAdminQueues(qc);
      invalidateQueryPrefixes(qc, ["activity-logs", "projects"]);
      void qc.invalidateQueries({ queryKey: qk.notificationsUnreadCount });
      toast.success(
        variables.body.decision === "REJECTED" ? "Payment declined" : "Payment verified"
      );
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

export function useMarkCommissionPaidMutation(leadId: string, repId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.markCommissionPaid,
    onSuccess: (data, _vars, _ctx, context) => {
      applyLeadDetailToCache(qc, leadId, data);
      const assignedRepId = repId ?? data.lead.assignedToUserId;
      if (assignedRepId && data.lead.status === "COMMISSION_PAID") {
        removeLeadFromTeamRepActiveCache(qc, assignedRepId, leadId);
      }
      invalidateLeadAndRep(qc, {
        leadId,
        repId: assignedRepId
      });
      qc.invalidateQueries({ queryKey: ["commissions"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      invalidateAdminQueues(qc);
      invalidateQueryPrefixes(qc, ["activity-logs"]);
      const meta = context?.meta as { skipSuccessToast?: boolean } | undefined;
      if (!meta?.skipSuccessToast) toast.success("Commission marked paid");
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

export function usePatchProjectMutation(leadId?: string, repId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      body
    }: {
      projectId: string;
      body: Record<string, unknown>;
    }) => salesApi.patchProject(projectId, body),
    onSuccess: (_data, { projectId }) => {
      qc.invalidateQueries({ queryKey: qk.project(projectId) });
      qc.invalidateQueries({ queryKey: ["projects"] });
      if (leadId) {
        invalidateLeadAndRep(qc, { leadId, repId: repId ?? undefined });
      }
      qc.invalidateQueries({ queryKey: ["leads"] });
      invalidateAdminQueues(qc);
      invalidateQueryPrefixes(qc, ["activity-logs", "commissions"]);
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

export function useTeamRepQuery(
  userId: string | undefined,
  enabled: boolean,
  status: "active" | "all" | "completed" = "active"
) {
  return useQuery({
    queryKey: [...qk.teamRep(userId ?? ""), status],
    queryFn: () => salesApi.teamRep(userId!, { status }),
    enabled: !!userId && enabled,
    staleTime: 60_000
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

export function usePendingActionsCountQuery(enabled: boolean) {
  return useQuery({
    queryKey: qk.pendingActionsCount,
    queryFn: () => salesApi.pendingActionsCount(),
    enabled,
    refetchInterval: enabled ? 60_000 : false
  });
}

export function usePendingActionsQuery(params: {
  page: number;
  pageSize: number;
  type?: import("../types").PendingActionType;
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = params;
  return useQuery({
    queryKey: qk.pendingActions(rest),
    queryFn: () => salesApi.pendingActions(rest),
    enabled
  });
}

export function useNotificationsUnreadCountQuery(enabled: boolean) {
  return useQuery({
    queryKey: qk.notificationsUnreadCount,
    queryFn: () => salesApi.notificationsUnreadCount(),
    enabled,
    refetchInterval: enabled ? 60_000 : false
  });
}

export function useNotificationsQuery(params: {
  page: number;
  pageSize: number;
  unreadOnly?: boolean;
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = params;
  return useQuery({
    queryKey: qk.notifications(rest),
    queryFn: () => salesApi.notifications(rest),
    enabled
  });
}

export function useMarkNotificationReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.markNotificationRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.notificationsUnreadCount });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e) => errToast(e, qc)
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
