import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  FolderKanban,
  IndianRupee,
  LogOut,
  Menu,
  UserCircle,
  Shield,
  FileSpreadsheet,
  ScrollText,
  Settings,
  Users
} from "lucide-react";
import { useSessionQuery, useLogoutMutation } from "../hooks/useSalesQueries";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
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

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar md:justify-start",
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
  );

export function SalesPortalLayout() {
  const { data } = useSessionQuery();
  const user = data?.user;
  const logout = useLogoutMutation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate("/portal/login", { replace: true })
    });
  };

  const mainLinks = (
    <>
      <NavLink to="/portal/leads" className={navClass} end>
        <ClipboardList className="h-5 w-5 shrink-0 md:h-4 md:w-4" />
        <span className="hidden md:inline">Leads</span>
      </NavLink>
      <NavLink to="/portal/projects" className={navClass}>
        <FolderKanban className="h-5 w-5 shrink-0 md:h-4 md:w-4" />
        <span className="hidden md:inline">Projects</span>
      </NavLink>
      <NavLink to="/portal/commissions" className={navClass}>
        <IndianRupee className="h-5 w-5 shrink-0 md:h-4 md:w-4" />
        <span className="hidden md:inline">Commissions</span>
      </NavLink>
    </>
  );

  const adminLinks = (
    <>
      <NavLink to="/portal/users" className={navClass} onClick={() => setMoreOpen(false)}>
        <Users className="h-5 w-5 shrink-0 md:h-4 md:w-4" />
        <span className="hidden md:inline">Users</span>
      </NavLink>
      <NavLink to="/portal/activity" className={navClass} onClick={() => setMoreOpen(false)}>
        <ScrollText className="h-5 w-5 shrink-0 md:h-4 md:w-4" />
        <span className="hidden md:inline">Activity</span>
      </NavLink>
      <NavLink to="/portal/settings" className={navClass} onClick={() => setMoreOpen(false)}>
        <Settings className="h-5 w-5 shrink-0 md:h-4 md:w-4" />
        <span className="hidden md:inline">Settings</span>
      </NavLink>
      <NavLink to="/portal/exports" className={navClass} onClick={() => setMoreOpen(false)}>
        <FileSpreadsheet className="h-5 w-5 shrink-0 md:h-4 md:w-4" />
        <span className="hidden md:inline">Exports</span>
      </NavLink>
    </>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0 md:pl-56">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b bg-card/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex min-w-0 items-center gap-2">
          <Shield className="h-6 w-6 shrink-0 text-accent" aria-hidden />
          <div className="min-w-0">
            <Link to="/portal/leads" className="truncate text-sm font-semibold tracking-tight">
              Shyara Sales
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {user?.displayName ?? user?.email}
              {user?.role ? ` · ${userRoleLabel(user.role)}` : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="min-h-11 shrink-0 gap-1.5 px-2 sm:px-3 md:min-h-9"
                aria-label="Account menu"
              >
                <UserCircle className="h-4 w-4 sm:hidden" aria-hidden />
                <span className="hidden sm:inline">Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link to="/portal/change-password">Change password</Link>
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

      <aside className="fixed bottom-0 left-0 right-0 z-50 flex h-[calc(4.5rem+env(safe-area-inset-bottom,0px))] items-start justify-around border-t bg-sidebar px-1 pt-1 md:hidden">
        <NavLink to="/portal/leads" className={navClass} end>
          <ClipboardList className="h-5 w-5" aria-hidden />
          <span className="sr-only">Leads</span>
        </NavLink>
        <NavLink to="/portal/projects" className={navClass}>
          <FolderKanban className="h-5 w-5" aria-hidden />
          <span className="sr-only">Projects</span>
        </NavLink>
        <NavLink to="/portal/commissions" className={navClass}>
          <IndianRupee className="h-5 w-5" aria-hidden />
          <span className="sr-only">Commissions</span>
        </NavLink>
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(navClass({ isActive: false }), "flex-col gap-0.5")}
              aria-label="Open more menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
              <span className="text-xs font-medium leading-none">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="pb-[env(safe-area-inset-bottom,0px)]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-1">
              {isAdmin && adminLinks}
              {isAdmin ? <Separator className="my-2" /> : null}
              <Button variant="ghost" className="min-h-11 justify-start" asChild>
                <Link to="/portal/change-password" onClick={() => setMoreOpen(false)}>
                  Change password
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
      </aside>

      <aside className="fixed left-0 top-0 z-30 hidden h-dvh w-56 flex-col border-r bg-sidebar md:flex">
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {mainLinks}
          {isAdmin && (
            <>
              <Separator className="my-2" />
              {adminLinks}
            </>
          )}
        </nav>
      </aside>

      <main id="main-content" className="flex-1 overflow-x-hidden px-3 py-4 md:px-6">
        <div className="mx-auto w-full max-w-[1200px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
