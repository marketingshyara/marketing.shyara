import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSessionQuery } from "../hooks/useSalesQueries";
import { defaultPortalHome, resolvePortalDestination } from "../lib/portalPaths";
import { normalizePortalReturnCandidate } from "../lib/sanitizeRedirect";

function PortalLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-2 bg-background" role="status" aria-live="polite">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      <span className="text-sm text-muted-foreground">Loading…</span>
    </div>
  );
}

export function RequireAuth() {
  const { data, isLoading, isFetching } = useSessionQuery();
  const location = useLocation();

  if (isLoading || (isFetching && data === undefined)) {
    return <PortalLoading />;
  }

  if (!data?.user) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/portal/login" replace state={{ from }} />;
  }

  return <Outlet />;
}

/** Blocks main app until password is changed; change-password route sits outside this. */
export function RequirePortalUnlocked() {
  const { data, isLoading, isFetching } = useSessionQuery();
  const location = useLocation();

  if (isLoading || (isFetching && data === undefined)) {
    return <PortalLoading />;
  }

  if (data?.user?.mustChangePassword && location.pathname !== "/portal/change-password") {
    const full = `${location.pathname}${location.search}`;
    const intended = resolvePortalDestination(
      data.user.role,
      normalizePortalReturnCandidate(full)
    );
    const search = `?returnTo=${encodeURIComponent(intended)}`;
    return <Navigate to={{ pathname: "/portal/change-password", search }} replace state={{ from: intended }} />;
  }

  return <Outlet />;
}

export function PublicLoginGate({ children }: { children: ReactNode }) {
  const { data, isLoading, isFetching } = useSessionQuery();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Match the other gates: wait out the first background refetch when no cached data yet, so a
  // stale login form doesn't flash before an authed user is redirected away.
  if (isLoading || (isFetching && data === undefined)) {
    return <PortalLoading />;
  }

  if (data?.user) {
    if (data.user.mustChangePassword) {
      const intended = resolvePortalDestination(
        data.user.role,
        searchParams.get("returnTo"),
        (location.state as { from?: string } | null)?.from
      );
      const search = `?returnTo=${encodeURIComponent(intended)}`;
      return <Navigate to={{ pathname: "/portal/change-password", search }} replace state={{ from: intended }} />;
    }
    const target = resolvePortalDestination(
      data.user.role,
      searchParams.get("returnTo"),
      (location.state as { from?: string } | null)?.from
    );
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}

export function RequireSalesRep() {
  const { data, isLoading, isFetching } = useSessionQuery();
  const location = useLocation();

  if (isLoading || (isFetching && data === undefined)) {
    return <PortalLoading />;
  }

  if (data?.user?.role === "ADMIN") {
    return <Navigate to="/portal/team" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const { data, isLoading, isFetching } = useSessionQuery();
  const location = useLocation();

  if (isLoading || (isFetching && data === undefined)) {
    return <PortalLoading />;
  }

  if (data?.user?.role !== "ADMIN") {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/portal/no-access" replace state={{ from }} />;
  }

  return <Outlet />;
}

/** Unknown `/portal/*` path: send authed users to leads, others to login (avoids extra bounce). */
export function PortalCatchAll() {
  const { data, isLoading } = useSessionQuery();

  if (isLoading) return <PortalLoading />;

  if (data?.user) {
    return <Navigate to="/portal/not-found" replace />;
  }

  return <Navigate to="/portal/login" replace />;
}
