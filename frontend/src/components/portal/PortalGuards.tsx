import { portalApi } from "@/lib/portal-api";
import type { Role } from "@/types/portal";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function usePortalSession() {
  return useQuery({
    queryKey: ["portal-session"],
    queryFn: portalApi.session,
    retry: false
  });
}

export function PortalProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
  const location = useLocation();
  const session = usePortalSession();

  if (session.isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading portal...</div>;
  }

  if (!session.data?.authenticated || !session.data.user) {
    return <Navigate to="/sales-portal/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(session.data.user.role)) {
    return <Navigate to="/sales-portal/dashboard" replace />;
  }

  return <Outlet />;
}
