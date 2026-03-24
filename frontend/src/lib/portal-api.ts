import type {
  PortalAuditEvent,
  PortalCommission,
  PortalNotification,
  PortalProject,
  PortalRevision,
  DashboardSummary,
  LeadDetailResponse,
  LeadRecord,
  PortalSessionResponse,
  PortalSettingsResponse,
  PortalUser,
  SupportContent
} from "@/types/portal";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ message: "Request failed." }))) as { message?: string };
    throw new Error(payload.message ?? "Request failed.");
  }

  if (response.headers.get("content-type")?.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export const portalApi = {
  health: () => request<{ ok: boolean }>("/health"),
  login: (email: string, password: string) =>
    request<{ user: PortalUser; message: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean; user: PortalUser }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword })
    }),
  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  session: () => request<PortalSessionResponse>("/auth/session"),
  dashboard: () => request<DashboardSummary>("/dashboard"),
  users: () => request<PortalUser[]>("/users"),
  createUser: (payload: Record<string, unknown>) =>
    request<PortalUser>("/users", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateUser: (userId: string, payload: Record<string, unknown>) =>
    request<PortalUser>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  resetPassword: (userId: string, newPassword: string) =>
    request<{ ok: boolean }>(`/users/${userId}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ newPassword })
    }),
  leads: (params?: Record<string, string>) =>
    request<LeadRecord[]>(`/leads${params ? `?${new URLSearchParams(params).toString()}` : ""}`),
  createLead: (payload: Record<string, unknown>) =>
    request<{ lead: LeadRecord; duplicateFlags: unknown[] }>("/leads", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  leadDetail: (leadId: string) => request<LeadDetailResponse>(`/leads/${leadId}`),
  updateLeadStatus: (leadId: string, status: string) =>
    request(`/leads/${leadId}/status`, {
      method: "POST",
      body: JSON.stringify({ status })
    }),
  addLeadNote: (leadId: string, payload: Record<string, unknown>) =>
    request(`/leads/${leadId}/notes`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  addFollowUp: (leadId: string, payload: Record<string, unknown>) =>
    request(`/leads/${leadId}/follow-ups`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  assignLead: (leadId: string, payload: Record<string, unknown>) =>
    request(`/leads/${leadId}/assign`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  resolveDuplicate: (flagId: string, resolutionNote: string) =>
    request(`/leads/duplicates/${flagId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolutionNote })
    }),
  closeLead: (leadId: string, payload: Record<string, unknown>) =>
    request(`/leads/${leadId}/close`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  commissions: () => request<PortalCommission[]>("/commissions"),
  updateCommission: (commissionId: string, payload: Record<string, unknown>) =>
    request(`/commissions/${commissionId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  projects: () => request<PortalProject[]>("/projects"),
  updateProjectStatus: (projectId: string, payload: Record<string, unknown>) =>
    request(`/projects/${projectId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  revisions: () => request<PortalRevision[]>("/revisions"),
  addRevision: (projectId: string, payload: Record<string, unknown>) =>
    request(`/projects/${projectId}/revisions`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateRevision: (revisionId: string, payload: Record<string, unknown>) =>
    request(`/revisions/${revisionId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  supportContent: () => request<SupportContent>("/support-content"),
  updateSupportContent: (payload: SupportContent) =>
    request<SupportContent>("/support-content", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  settings: () => request<PortalSettingsResponse>("/settings"),
  updateSettings: (payload: PortalSettingsResponse) =>
    request<PortalSettingsResponse>("/settings", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  notifications: () => request<PortalNotification[]>("/notifications"),
  markNotificationRead: (notificationId: string) =>
    request(`/notifications/${notificationId}/read`, { method: "POST" }),
  audit: () => request<PortalAuditEvent[]>("/audit"),
  leadsCsvUrl: `${API_BASE}/reports/leads.csv`,
  commissionsCsvUrl: `${API_BASE}/reports/commissions.csv`,
  projectsCsvUrl: `${API_BASE}/reports/projects.csv`
};
