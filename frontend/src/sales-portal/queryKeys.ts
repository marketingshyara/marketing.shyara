export const qk = {
  session: ["session"] as const,
  settings: ["portal-settings"] as const,
  adminSettings: ["admin-settings"] as const,
  users: (page: number, pageSize: number) => ["users", page, pageSize] as const,
  leads: (params: Record<string, unknown>) => ["leads", params] as const,
  lead: (id: string) => ["lead", id] as const,
  commissions: (params: Record<string, unknown>) => ["commissions", params] as const,
  projects: (page: number, pageSize: number) => ["projects", page, pageSize] as const,
  project: (id: string) => ["project", id] as const,
  activityLogs: (params: Record<string, unknown>) => ["activity-logs", params] as const
};
