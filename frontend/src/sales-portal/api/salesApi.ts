import { apiBlob, apiJson, downloadBlob } from "./client";
import type {
  ActivityLog,
  Commission,
  Lead,
  LeadDetailResponse,
  LeadPaymentWithRelations,
  Paginated,
  PendingActionItem,
  PipelineStageVerifyKey,
  PortalNotification,
  PortalSettingsValues,
  Project,
  RepPortalSettings,
  SessionUser,
  User,
  WebsiteTemplate
} from "../types";
import type { LeadStatus } from "../types";

export type VerifyPaymentRequestBody =
  | { decision: "VERIFIED"; externalReference: string; adminNote?: string | null }
  | { decision: "REJECTED"; adminNote?: string | null };

export const salesApi = {
  session: () => apiJson<{ user: SessionUser | null }>("GET", "/auth/session"),

  login: (body: { email: string; password: string; rememberDevice?: boolean }) =>
    apiJson<{ user: SessionUser }>("POST", "/auth/login", body),

  logout: () => apiJson<{ ok: boolean }>("POST", "/auth/logout"),

  changePassword: (body: { newPassword: string; currentPassword?: string }) =>
    apiJson<{ user: SessionUser }>("POST", "/auth/change-password", body),

  settings: () => apiJson<{ settings: RepPortalSettings }>("GET", "/settings"),

  adminSettings: () =>
    apiJson<{ settings: PortalSettingsValues }>("GET", "/admin/settings"),

  patchAdminSettings: (body: Partial<PortalSettingsValues>) =>
    apiJson<{ settings: PortalSettingsValues }>("PATCH", "/admin/settings", body),

  users: (params: { page?: number; pageSize?: number }) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
    const qs = q.toString();
    return apiJson<Paginated<User>>("GET", `/users${qs ? `?${qs}` : ""}`);
  },

  createUser: (body: Record<string, unknown>) =>
    apiJson<{ user: User; temporaryPassword?: string }>("POST", "/users", body),

  patchUser: (id: string, body: Record<string, unknown>) =>
    apiJson<{ user: User }>("PATCH", `/users/${id}`, body),

  resetUserPassword: (id: string, body: { temporaryPassword: string }) =>
    apiJson<{ user: User }>("POST", `/users/${id}/reset-password`, body),

  leads: (params: {
    page?: number;
    pageSize?: number;
    view?: "leads" | "clients" | "completed";
    status?: LeadStatus;
    search?: string;
    from?: Date;
    to?: Date;
    assignedToUserId?: string;
  }) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
    if (params.view) q.set("view", params.view);
    if (params.status) q.set("status", params.status);
    if (params.search) q.set("search", params.search);
    if (params.from) q.set("from", params.from.toISOString());
    if (params.to) q.set("to", params.to.toISOString());
    if (params.assignedToUserId) q.set("assignedToUserId", params.assignedToUserId);
    const qs = q.toString();
    return apiJson<Paginated<Lead>>("GET", `/leads${qs ? `?${qs}` : ""}`);
  },

  lead: (id: string) => apiJson<LeadDetailResponse>("GET", `/leads/${id}`),

  createLead: (body: Record<string, unknown>) =>
    apiJson<{ lead: Lead }>("POST", "/leads", body),

  convertLead: (
    id: string,
    body: {
      websiteTemplateId: string;
      agreedTotalCents: number;
      advanceAmountCents?: number;
      repNote?: string | null;
    }
  ) => apiJson<LeadDetailResponse>("POST", `/leads/${id}/convert`, body),

  patchLead: (id: string, body: Record<string, unknown>) =>
    apiJson<LeadDetailResponse>("PATCH", `/leads/${id}`, body),

  verifyLeadStage: (leadId: string, stageKey: PipelineStageVerifyKey) =>
    apiJson<LeadDetailResponse>("POST", `/leads/${leadId}/stages/${stageKey}/verify`, {}),

  rejectLeadStage: (
    leadId: string,
    stageKey: PipelineStageVerifyKey,
    body?: { adminNote?: string | null }
  ) => apiJson<LeadDetailResponse>("POST", `/leads/${leadId}/stages/${stageKey}/reject`, body ?? {}),

  markPayment: (
    leadId: string,
    body: { kind: "ADVANCE" | "FINAL"; amountCents: number; repNote?: string | null }
  ) => apiJson<{ payment: unknown }>("POST", `/leads/${leadId}/payments`, body),

  verifyPayment: (paymentId: string, body: VerifyPaymentRequestBody) =>
    apiJson<{ payment: unknown; lead: Lead }>("POST", `/payments/${paymentId}/verify`, body),

  pendingPaymentsCount: () => apiJson<{ total: number }>("GET", "/payments/pending/count"),

  pendingActionsCount: () => apiJson<{ total: number }>("GET", "/admin/pending-actions/count"),

  pendingActions: (params: {
    page?: number;
    pageSize?: number;
    type?: import("../types").PendingActionType;
  }) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
    if (params.type) q.set("type", params.type);
    const qs = q.toString();
    return apiJson<Paginated<PendingActionItem>>(
      "GET",
      `/admin/pending-actions${qs ? `?${qs}` : ""}`
    );
  },

  notificationsUnreadCount: () =>
    apiJson<{ total: number }>("GET", "/notifications/unread-count"),

  notifications: (params: { page?: number; pageSize?: number; unreadOnly?: boolean }) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
    if (params.unreadOnly) q.set("unreadOnly", "1");
    const qs = q.toString();
    return apiJson<Paginated<PortalNotification>>(
      "GET",
      `/notifications${qs ? `?${qs}` : ""}`
    );
  },

  markNotificationRead: (id: string) =>
    apiJson<{ ok: boolean }>("POST", `/notifications/${id}/read`, {}),

  pendingPayments: (params: {
    page?: number;
    pageSize?: number;
    kind?: "ADVANCE" | "FINAL";
    assignedToUserId?: string;
    search?: string;
    from?: Date;
    to?: Date;
  }) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
    if (params.kind) q.set("kind", params.kind);
    if (params.assignedToUserId) q.set("assignedToUserId", params.assignedToUserId);
    if (params.search) q.set("search", params.search);
    if (params.from) q.set("from", params.from.toISOString());
    if (params.to) q.set("to", params.to.toISOString());
    const qs = q.toString();
    return apiJson<Paginated<LeadPaymentWithRelations>>(
      "GET",
      `/payments/pending${qs ? `?${qs}` : ""}`
    );
  },

  commissions: (params: { page?: number; pageSize?: number; isPaid?: boolean }) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
    if (params.isPaid === true) q.set("isPaid", "true");
    if (params.isPaid === false) q.set("isPaid", "false");
    const qs = q.toString();
    return apiJson<
      Paginated<Commission & { lead: { id: string; clientName: string; status: LeadStatus } }>
    >("GET", `/commissions${qs ? `?${qs}` : ""}`);
  },

  patchCommission: (id: string, body: { amountCents: number }) =>
    apiJson<LeadDetailResponse & { commission: Commission }>("PATCH", `/commissions/${id}`, body),

  markCommissionPaid: (id: string) =>
    apiJson<LeadDetailResponse & { commission: Commission }>(
      "POST",
      `/commissions/${id}/mark-paid`
    ),

  projects: (params: { page?: number; pageSize?: number }) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
    const qs = q.toString();
    return apiJson<Paginated<Project>>("GET", `/projects${qs ? `?${qs}` : ""}`);
  },

  project: (id: string) => apiJson<{ project: Project }>("GET", `/projects/${id}`),

  createProject: (body: Record<string, unknown>) =>
    apiJson<{ project: Project }>("POST", "/projects", body),

  patchProject: (id: string, body: Record<string, unknown>) =>
    apiJson<{ project: Project }>("PATCH", `/projects/${id}`, body),

  websiteTemplates: () => apiJson<{ items: WebsiteTemplate[] }>("GET", "/website-templates"),

  teamReps: () => apiJson<{ items: import("../types").TeamRepSummary[] }>("GET", "/team/reps"),

  teamRep: (userId: string, params?: { status?: "active" | "all" | "completed" }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    const qs = q.toString();
    return apiJson<{
      rep: import("../types").TeamRepSummary;
      projects: import("../types").TeamRepProject[];
    }>("GET", `/team/reps/${userId}${qs ? `?${qs}` : ""}`);
  },

  activityLogs: (params: {
    page?: number;
    pageSize?: number;
    userId?: string;
    entityType?: string;
    entityId?: string;
    from?: Date;
    to?: Date;
  }) => {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
    if (params.userId) q.set("userId", params.userId);
    if (params.entityType) q.set("entityType", params.entityType);
    if (params.entityId) q.set("entityId", params.entityId);
    if (params.from) q.set("from", params.from.toISOString());
    if (params.to) q.set("to", params.to.toISOString());
    const qs = q.toString();
    return apiJson<Paginated<ActivityLog>>("GET", `/activity-logs${qs ? `?${qs}` : ""}`);
  },

  async exportXlsx(kind: "leads" | "commissions" | "users") {
    const { blob, filename } = await apiBlob(`/export/${kind}.xlsx`);
    downloadBlob(blob, filename ?? `${kind}.xlsx`);
  }
};
