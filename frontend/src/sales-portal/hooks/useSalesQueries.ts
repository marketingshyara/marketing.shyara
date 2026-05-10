import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "../api/client";
import { salesApi } from "../api/salesApi";
import { qk } from "../queryKeys";
import type { LeadStatus, PortalSettingsValues, SessionUser } from "../types";

function errToast(e: unknown) {
  if (e instanceof ApiError) toast.error(e.message);
  else toast.error("Something went wrong");
}

export function useSessionQuery() {
  return useQuery({
    queryKey: qk.session,
    queryFn: () => salesApi.session(),
    staleTime: 60_000
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
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.session }),
    onError: errToast
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
    onError: errToast
  });
}

export function useChangePasswordMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.changePassword,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.session });
      toast.success("Password updated");
    },
    onError: errToast
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
      toast.success("Settings saved");
    },
    onError: errToast
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
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      if (data.temporaryPassword) {
        toast.success(`User created. Temporary password: ${data.temporaryPassword}`);
      } else toast.success("User created");
    },
    onError: errToast
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
      toast.success("User updated");
    },
    onError: errToast
  });
}

export function useResetPasswordMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { temporaryPassword: string } }) =>
      salesApi.resetUserPassword(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Password reset; user must change password on next login.");
    },
    onError: errToast
  });
}

export function useLeadsQuery(params: {
  page: number;
  pageSize: number;
  status?: LeadStatus;
  search?: string;
  from?: Date;
  to?: Date;
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
      toast.success("Lead created");
    },
    onError: errToast
  });
}

export function usePatchLeadMutation(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => salesApi.patchLead(leadId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.lead(leadId) });
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead updated");
    },
    onError: errToast
  });
}

export function useTransitionLeadMutation(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { toStatus: LeadStatus }) => salesApi.transitionLead(leadId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.lead(leadId) });
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Status updated");
    },
    onError: errToast
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
      toast.success("Payment marked");
    },
    onError: errToast
  });
}

export function useVerifyPaymentMutation(leadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      body
    }: {
      paymentId: string;
      body: { decision: "VERIFIED" | "REJECTED"; adminNote?: string | null };
    }) => salesApi.verifyPayment(paymentId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.lead(leadId) });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["commissions"] });
      toast.success("Verification saved");
    },
    onError: errToast
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
      toast.success("Commission updated");
    },
    onError: errToast
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
      toast.success("Commission marked paid");
    },
    onError: errToast
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Project created");
    },
    onError: errToast
  });
}

export function usePatchProjectMutation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => salesApi.patchProject(projectId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.project(projectId) });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated");
    },
    onError: errToast
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
  return useMutation({
    mutationFn: salesApi.exportXlsx,
    onSuccess: () => toast.success("Download started"),
    onError: errToast
  });
}

export type SessionData = { user: SessionUser | null };
