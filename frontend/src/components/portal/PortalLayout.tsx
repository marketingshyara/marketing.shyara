import { portalApi } from "@/lib/portal-api";
import { usePortalSession } from "@/components/portal/PortalGuards";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, FileSpreadsheet, FolderKanban, Gauge, LogOut, Settings, Shield, Users } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { FormEvent, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

const navByRole = {
  admin: [
    { to: "/sales-portal/dashboard", label: "Dashboard", icon: Gauge },
    { to: "/sales-portal/leads", label: "Leads", icon: FileSpreadsheet },
    { to: "/sales-portal/users", label: "Users", icon: Users },
    { to: "/sales-portal/commissions", label: "Commissions", icon: Shield },
    { to: "/sales-portal/projects", label: "Projects", icon: FolderKanban },
    { to: "/sales-portal/revisions", label: "Revisions", icon: FolderKanban },
    { to: "/sales-portal/reports", label: "Reports", icon: FileSpreadsheet },
    { to: "/sales-portal/settings", label: "Settings", icon: Settings },
    { to: "/sales-portal/audit", label: "Audit", icon: Shield }
  ],
  sales_associate: [
    { to: "/sales-portal/dashboard", label: "Dashboard", icon: Gauge },
    { to: "/sales-portal/leads", label: "Leads", icon: FileSpreadsheet },
    { to: "/sales-portal/commissions", label: "Commissions", icon: Shield },
    { to: "/sales-portal/projects", label: "Projects", icon: FolderKanban }
  ],
  operations: [
    { to: "/sales-portal/dashboard", label: "Dashboard", icon: Gauge },
    { to: "/sales-portal/projects", label: "Projects", icon: FolderKanban },
    { to: "/sales-portal/revisions", label: "Revisions", icon: FolderKanban }
  ]
} as const;

export function PortalLayout() {
  const queryClient = useQueryClient();
  const session = usePortalSession();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const notifications = useQuery({
    queryKey: ["portal-notifications"],
    queryFn: portalApi.notifications,
    enabled: Boolean(session.data?.authenticated)
  });

  const logout = useMutation({
    mutationFn: portalApi.logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portal-session"] });
    }
  });
  const markNotificationRead = useMutation({
    mutationFn: portalApi.markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portal-notifications"] });
    }
  });
  const changePassword = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      portalApi.changePassword(currentPassword, newPassword),
    onSuccess: async () => {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["portal-session"] }),
        queryClient.invalidateQueries({ queryKey: ["portal-notifications"] })
      ]);
    },
    onError: (error: Error) => {
      setPasswordError(error.message);
    }
  });

  const user = session.data?.user;
  if (!user) return null;

  const navItems = navByRole[user.role];
  const unreadNotifications = (notifications.data ?? []).filter((item) => !item.readAt);

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation must match.");
      return;
    }
    setPasswordError(null);
    changePassword.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/10 bg-slate-900/80 p-6">
          <Link to="/" className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Shyara Portal
          </Link>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-emerald-300">{user.role.replace("_", " ")}</p>
          </div>
          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                      isActive ? "bg-cyan-400/15 text-cyan-200" : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-slate-950/80 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Internal Sales Portal</p>
              <h1 className="text-xl font-semibold text-white">Sales, commissions, projects, and delivery tracking</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                <Bell className="mr-2 inline h-4 w-4 text-cyan-300" />
                {unreadNotifications.length} unread
              </div>
              <button
                type="button"
                onClick={() => logout.mutate()}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </header>
          <div className="space-y-6 p-6">
            {user.mustChangePassword ? (
              <section className="rounded-[28px] border border-amber-400/30 bg-amber-400/10 p-6">
                <h2 className="text-lg font-semibold text-amber-100">Password update required</h2>
                <p className="mt-2 max-w-2xl text-sm text-amber-50/80">
                  This account is using a temporary password. Set a new password before continuing with daily portal work.
                </p>
                <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={handlePasswordSubmit}>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                    placeholder="Current password"
                    className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
                  />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                    placeholder="New password"
                    className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
                  />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    placeholder="Confirm new password"
                    className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
                  />
                  {passwordError ? <p className="md:col-span-3 text-sm text-rose-200">{passwordError}</p> : null}
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={changePassword.isPending}
                      className="rounded-full bg-amber-300 px-5 py-3 font-medium text-slate-950 disabled:opacity-70"
                    >
                      {changePassword.isPending ? "Updating..." : "Update password"}
                    </button>
                  </div>
                </form>
              </section>
            ) : null}
            <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Notifications</h2>
                  <p className="mt-1 text-sm text-slate-400">Unread operational updates and admin actions.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {(notifications.data ?? []).slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-300">{item.message}</p>
                        <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                      {!item.readAt ? (
                        <button
                          type="button"
                          onClick={() => markNotificationRead.mutate(item.id)}
                          className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-200"
                        >
                          Mark read
                        </button>
                      ) : (
                        <span className="rounded-full border border-emerald-400/30 px-3 py-2 text-xs text-emerald-200">Read</span>
                      )}
                    </div>
                  </div>
                ))}
                {!notifications.data?.length ? <p className="text-sm text-slate-400">No notifications yet.</p> : null}
              </div>
            </section>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
