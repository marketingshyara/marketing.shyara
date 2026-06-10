import type { LucideIcon } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  ClipboardList,
  FileCheck2,
  History,
  IndianRupee,
  LogOut,
  Menu,
  UserCircle,
  Settings,
  Users,
  UsersRound,
  Wallet
} from "lucide-react";
import {
  useSessionQuery,
  useLogoutMutation,
  usePendingActionsCountQuery
} from "../hooks/useSalesQueries";
import { PortalNotificationsBell } from "../components/PortalNotificationsBell";
import { PortalErrorBoundary } from "../components/PortalErrorBoundary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { userRoleLabel } from "../lib/copy";
import { defaultPortalHome } from "../lib/portalPaths";
import { passwordCopy } from "../lib/passwordCopy";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  approvalsBadge?: boolean;
};

const REP_NAV: NavItem[] = [
  { to: "/portal/pipeline", label: "Pipeline", icon: ClipboardList, end: true },
  { to: "/portal/commission", label: "Commission", icon: IndianRupee },
  { to: "/portal/resources", label: "Resources", icon: BookOpen }
];

const ADMIN_NAV: NavItem[] = [
  { to: "/portal/team", label: "Team", icon: UsersRound, end: true },
  { to: "/portal/projects", label: "All clients", icon: Briefcase },
  { to: "/portal/reviews", label: "Reviews", icon: FileCheck2, approvalsBadge: true },
  { to: "/portal/commission", label: "Commission", icon: IndianRupee },
  { to: "/portal/payments", label: "Payments", icon: Wallet },
  { to: "/portal/activity", label: "Activity", icon: History },
  { to: "/portal/users", label: "Users", icon: Users },
  { to: "/portal/settings", label: "Settings", icon: Settings }
];

const sidebarNavClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex min-h-11 min-w-11 items-center justify-center gap-2 border-2 border-transparent px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#FF3333] md:justify-start",
    isActive
      ? "portal-nav-active border-[#0A0A0A]/10"
      : "text-[#0A0A0A] hover:bg-[#FAFAFA]"
  );

const mobileTabNavClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-center text-xs font-bold uppercase leading-tight transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#FF3333]",
    isActive ? "text-[#FF3333]" : "text-[#0A0A0A]/70"
  );

const sheetNavClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex min-h-11 w-full flex-row items-center justify-start gap-3 border-2 border-transparent px-3 py-2 text-sm font-bold uppercase tracking-wide transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#FF3333]",
    isActive ? "portal-nav-active" : "text-[#0A0A0A] hover:bg-[#FAFAFA]"
  );

export function SalesPortalLayout() {
  const { data } = useSessionQuery();
  const user = data?.user;
  const logout = useLogoutMutation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";
  const navItems = isAdmin ? ADMIN_NAV : REP_NAV;
  const homePath = user ? defaultPortalHome(user.role) : "/portal/pipeline";
  const pendingCount = usePendingActionsCountQuery(isAdmin);
  const pendingTotal = pendingCount.data?.total ?? 0;

  const primaryMobileNav = isAdmin
    ? ADMIN_NAV.filter(
        (i) =>
          i.to === "/portal/team" ||
          i.to === "/portal/reviews" ||
          i.to === "/portal/payments"
      )
    : REP_NAV;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate("/portal/login", { replace: true })
    });
  };

  const renderNavIcon = (item: NavItem) => {
    const Icon = item.icon;
    if (item.approvalsBadge) {
      return (
        <span className="relative inline-flex shrink-0">
          <Icon className="h-5 w-5 shrink-0 md:h-4 md:w-4" aria-hidden />
          {pendingTotal > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-5 min-w-5 justify-center px-1 text-[10px] leading-none"
              aria-label={`${pendingTotal} pending verifications`}
            >
              {pendingTotal > 99 ? "99+" : pendingTotal}
            </Badge>
          ) : null}
        </span>
      );
    }
    return <Icon className="h-5 w-5 shrink-0 md:h-4 md:w-4" aria-hidden />;
  };

  const renderMobileTabIcon = (item: NavItem) => {
    const Icon = item.icon;
    if (item.approvalsBadge) {
      return (
        <span className="relative inline-flex shrink-0">
          <Icon className="h-5 w-5" aria-hidden />
          {pendingTotal > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-5 min-w-5 justify-center px-1 text-[10px] leading-none"
              aria-label={`${pendingTotal} pending verifications`}
            >
              {pendingTotal > 99 ? "99+" : pendingTotal}
            </Badge>
          ) : null}
        </span>
      );
    }
    return <Icon className="h-5 w-5 shrink-0" aria-hidden />;
  };

  const renderSheetIcon = (item: NavItem) => {
    const Icon = item.icon;
    if (item.approvalsBadge) {
      return (
        <span className="relative inline-flex shrink-0">
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
          {pendingTotal > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-5 min-w-5 justify-center px-1 text-[10px] leading-none"
              aria-label={`${pendingTotal} pending verifications`}
            >
              {pendingTotal > 99 ? "99+" : pendingTotal}
            </Badge>
          ) : null}
        </span>
      );
    }
    return <Icon className="h-5 w-5 shrink-0" aria-hidden />;
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#FAFAFA] pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0 md:pl-56">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b-2 border-[#0A0A0A] bg-white px-3 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 pr-1">
          <Link to={homePath} className="font-logo shrink-0 text-lg leading-none">
            SHYARA<span className="text-[#FF3333]">.</span>
          </Link>
          <div className="min-w-0 border-l-2 border-[#0A0A0A]/20 pl-2">
            <p className="truncate text-xs font-bold uppercase tracking-wide text-[#0A0A0A]">
              {user?.displayName ?? user?.email}
            </p>
            <p className="hidden truncate text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]/50 sm:block">
              {user?.role ? userRoleLabel(user.role) : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {user ? <PortalNotificationsBell user={user} /> : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="min-h-11 min-w-11 shrink-0 touch-manipulation border-2 border-[#0A0A0A] shadow-[2px_2px_0_0_#0A0A0A] md:h-9 md:min-h-9 md:w-auto md:gap-1.5 md:px-2"
                aria-label="Account menu"
              >
                <UserCircle className="h-5 w-5 shrink-0 md:h-4 md:w-4" aria-hidden />
                <span className="sr-only md:not-sr-only md:inline">Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link to="/portal/change-password" className="flex flex-col items-start gap-0.5">
                  <span>{passwordCopy.changePassword}</span>
                  <span className="hidden text-xs font-normal text-muted-foreground md:inline">
                    {passwordCopy.changePasswordMenuHint}
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={logout.isPending}>
                <LogOut className="mr-2 h-4 w-4" aria-hidden />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 right-0 z-50 flex h-[calc(4.5rem+env(safe-area-inset-bottom,0px))] items-start justify-around border-t-2 border-[#0A0A0A] bg-white px-1 pt-1 md:hidden">
        {primaryMobileNav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={mobileTabNavClass}>
            {renderMobileTabIcon(item)}
            <span className="max-w-[5.5rem] truncate text-[10px] font-medium leading-tight" title={item.label}>
              {item.label}
            </span>
          </NavLink>
        ))}
        {isAdmin ? (
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(mobileTabNavClass({ isActive: false }), "gap-0.5")}
                aria-label="Open more menu"
              >
                <Menu className="h-5 w-5 shrink-0" aria-hidden />
                <span className="text-[10px] font-medium leading-tight">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="pb-[env(safe-area-inset-bottom,0px)]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-1">
                <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Work
                </p>
                {ADMIN_NAV.filter((i) =>
                  i.to === "/portal/commission" || i.to === "/portal/payments"
                ).map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={sheetNavClass}
                    onClick={() => setMoreOpen(false)}
                  >
                    {renderSheetIcon(item)}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                <p className="mt-2 px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Admin
                </p>
                {ADMIN_NAV.filter((i) =>
                  ["/portal/activity", "/portal/users", "/portal/settings"].includes(i.to)
                ).map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={sheetNavClass}
                    onClick={() => setMoreOpen(false)}
                  >
                    {renderSheetIcon(item)}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                <Separator className="my-2" />
                <Button variant="ghost" className="min-h-11 justify-start" asChild>
                  <Link to="/portal/change-password" onClick={() => setMoreOpen(false)}>
                    {passwordCopy.changePassword}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="min-h-11 justify-start text-destructive"
                  onClick={() => {
                    setMoreOpen(false);
                    handleLogout();
                  }}
                >
                  Log out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        ) : null}
      </aside>

      <aside className="fixed left-0 top-0 z-30 hidden h-dvh w-56 flex-col border-r-2 border-[#0A0A0A] bg-white pt-14 md:flex">
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={sidebarNavClass}>
              {renderNavIcon(item)}
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main id="main-content" className="flex-1 overflow-x-hidden px-3 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-[1200px]">
          <PortalErrorBoundary role={user?.role}>
            <Outlet />
          </PortalErrorBoundary>
        </div>
      </main>
    </div>
  );
}
