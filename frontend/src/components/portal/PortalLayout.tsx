import { portalApi } from "@/lib/portal-api";
import { cn } from "@/lib/utils";
import { usePortalSession } from "@/components/portal/PortalGuards";
import {
  PortalPanel,
  PortalSectionHeading,
  PortalStatusBadge
} from "@/components/portal/portal-ui";
import {
  formatPortalDateTime,
  formatPortalLabel,
  portalButtonPrimaryClass,
  portalButtonSecondaryClass,
  portalInputClass
} from "@/components/portal/portal-theme";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  FileSpreadsheet,
  FolderKanban,
  Gauge,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  X
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { FormEvent, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import shyaraLogo from "@/assets/shyara-logo.png";

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
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

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
  const notificationItems = notifications.data ?? [];
  const unreadNotifications = notificationItems.filter((item) => !item.readAt);

  if (!user) {
    return null;
  }

  const navItems = navByRole[user.role];

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

  const navigation = (
    <div className="flex h-full flex-col gap-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-3">
          <img src={shyaraLogo} alt="Shyara Marketing" className="h-10 w-auto" />
          <div>
            <p className="text-sm font-extrabold tracking-tight text-accent">Shyara Marketing</p>
            <p className="text-caption uppercase tracking-[0.2em] text-muted-foreground">Sales Portal</p>
          </div>
        </Link>
      </div>

      <PortalPanel className="bg-[hsl(var(--surface))] p-5">
        <p className="text-sm font-semibold text-foreground">{user.name}</p>
        <p className="mt-1 text-small text-muted-foreground">{user.email}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <PortalStatusBadge status={user.status}>{user.status}</PortalStatusBadge>
          <span className="portal-badge portal-badge-info">{formatPortalLabel(user.role)}</span>
        </div>
      </PortalPanel>

      <nav className="space-y-1.5" aria-label="Portal navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex min-h-[48px] items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "border-accent/25 bg-accent/10 text-foreground shadow-sm"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <PortalPanel className="mt-auto bg-ctaBand text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Operating Standard</p>
        <p className="mt-3 text-sm font-semibold">Keep lead data complete, follow-ups logged, and handoffs clear.</p>
        <p className="mt-2 text-sm leading-relaxed text-white/75">
          This portal mirrors the main Shyara brand while staying operationally focused for internal teams.
        </p>
      </PortalPanel>
    </div>
  );

  return (
    <div className="portal-shell">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="flex min-h-screen">
        <aside className="portal-sidebar sticky top-0 hidden h-screen w-[300px] shrink-0 overflow-y-auto px-6 py-6 xl:block">
          {navigation}
        </aside>

        {mobileNavOpen ? (
          <>
            <button
              type="button"
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] xl:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="portal-sidebar fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[320px] overflow-y-auto px-5 py-5 xl:hidden">
              {navigation}
            </aside>
          </>
        ) : null}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
                    aria-expanded={mobileNavOpen}
                    onClick={() => setMobileNavOpen((current) => !current)}
                    className={cn(portalButtonSecondaryClass, "h-11 w-11 rounded-full px-0 xl:hidden")}
                  >
                    {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </button>
                  <div>
                    <p className="portal-eyebrow">Internal Sales Portal</p>
                    <h1 className="text-lg font-semibold text-foreground md:text-2xl">
                      Sales, commissions, projects, and delivery tracking
                    </h1>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm">
                    <Bell className="h-4 w-4 text-accent" />
                    <span>
                      {unreadNotifications.length} unread
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => logout.mutate()}
                    className={portalButtonSecondaryClass}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="space-y-6">
              {user.mustChangePassword ? (
                <PortalPanel className="border-amber-200 bg-amber-50">
                  <PortalSectionHeading
                    title="Password update required"
                    description="This account is using a temporary password. Set a new password before continuing daily portal work."
                  />
                  <form className="mt-5 grid gap-3 md:grid-cols-3" onSubmit={handlePasswordSubmit}>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Current password
                      </span>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            currentPassword: event.target.value
                          }))
                        }
                        className={portalInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        New password
                      </span>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            newPassword: event.target.value
                          }))
                        }
                        className={portalInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Confirm password
                      </span>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            confirmPassword: event.target.value
                          }))
                        }
                        className={portalInputClass}
                      />
                    </label>
                    {passwordError ? (
                      <p className="text-sm font-medium text-rose-700 md:col-span-3">{passwordError}</p>
                    ) : null}
                    <div className="flex justify-end md:col-span-3">
                      <button
                        type="submit"
                        disabled={changePassword.isPending}
                        className={portalButtonPrimaryClass}
                      >
                        {changePassword.isPending ? "Updating..." : "Update password"}
                      </button>
                    </div>
                  </form>
                </PortalPanel>
              ) : null}

              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0">
                  <Outlet />
                </div>

                <aside className="space-y-6">
                  <PortalPanel className="2xl:sticky 2xl:top-24">
                    <PortalSectionHeading
                      title="Notifications"
                      description="Unread operational updates and admin actions."
                    />
                    <div className="portal-card-list mt-5">
                      {notificationItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="portal-list-card">
                          <div className="flex flex-col gap-3">
                            <div>
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="font-semibold text-foreground">{item.title}</p>
                                {item.readAt ? (
                                  <PortalStatusBadge status="read">Read</PortalStatusBadge>
                                ) : (
                                  <PortalStatusBadge status="new">Unread</PortalStatusBadge>
                                )}
                              </div>
                              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.message}</p>
                              <p className="mt-3 text-caption text-muted-foreground">
                                {formatPortalDateTime(item.createdAt)}
                              </p>
                            </div>
                            {!item.readAt ? (
                              <button
                                type="button"
                                onClick={() => markNotificationRead.mutate(item.id)}
                                className={cn(portalButtonSecondaryClass, "w-full")}
                              >
                                Mark read
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                      {!notificationItems.length ? (
                        <p className="text-sm text-muted-foreground">No notifications yet.</p>
                      ) : null}
                    </div>
                  </PortalPanel>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
