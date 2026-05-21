import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  PortalCatchAll,
  PublicLoginGate,
  RequireAdmin,
  RequireAuth,
  RequirePortalUnlocked,
  RequireSalesRep
} from "./guards/PortalGuards";
import { SalesPortalLayout } from "./layout/SalesPortalLayout";
import { PortalLoginPage } from "./pages/PortalLoginPage";
import { PortalChangePasswordPage } from "./pages/PortalChangePasswordPage";
import { PipelineListPage } from "./pages/pipeline/PipelineListPage";
import { PipelineDetailGate } from "./pages/pipeline/PipelineDetailGate";
import { PipelineNewLeadPage } from "./pages/pipeline/PipelineNewLeadPage";
import { ResourcesPage } from "./pages/resources/ResourcesPage";
import { ReviewsPage } from "./pages/admin/ReviewsPage";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { TeamHubPage } from "./pages/admin/TeamHubPage";
import { RepProjectsPage } from "./pages/admin/RepProjectsPage";
import { AdminProjectPage } from "./pages/admin/AdminProjectPage";
import { UsersPage } from "./pages/UsersPage";
import { ActivityLogsPage } from "./pages/admin/ActivityLogsPage";
import { PendingPaymentsPage } from "./pages/admin/PendingPaymentsPage";
import { CommissionPage } from "./pages/rep/CommissionPage";
import { Button } from "@/components/ui/button";
import { ShieldAlert, SearchX } from "lucide-react";
import { useSessionQuery } from "./hooks/useSalesQueries";
import { RoleAwareRedirect } from "./components/RoleAwareRedirect";
import { defaultPortalHome } from "./lib/portalPaths";
import { getSafePortalReturnPath } from "./lib/sanitizeRedirect";

function NoAccessPage() {
  const location = useLocation();
  const { data } = useSessionQuery();
  const fallback = defaultPortalHome(data?.user?.role ?? "SALES_REP");
  const from = getSafePortalReturnPath(
    fallback,
    (location.state as { from?: string } | null)?.from
  );
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
      <ShieldAlert className="h-10 w-10 text-amber-600" aria-hidden />
      <h1 className="text-2xl font-semibold">You Do Not Have Access</h1>
      <p className="text-sm text-muted-foreground">
        This section is only available to administrators.
      </p>
      <Button asChild className="min-h-11">
        <Link to={from}>Go Back</Link>
      </Button>
    </div>
  );
}

function NotFoundPage() {
  const { data } = useSessionQuery();
  const home = defaultPortalHome(data?.user?.role ?? "SALES_REP");
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
      <SearchX className="h-10 w-10 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-semibold">Page Not Found</h1>
      <Button asChild className="min-h-11">
        <Link to={home}>Go to home</Link>
      </Button>
    </div>
  );
}

function LegacyRedirect({ to }: { to: string }) {
  return <Navigate to={to} replace />;
}

function PortalIndexRedirect() {
  const { data, isLoading } = useSessionQuery();
  if (isLoading || !data?.user) return null;
  return <Navigate to={defaultPortalHome(data.user.role)} replace />;
}

export function PortalRoutes() {
  return (
    <Routes>
      <Route
        path="login"
        element={
          <PublicLoginGate>
            <PortalLoginPage />
          </PublicLoginGate>
        }
      />
      <Route element={<RequireAuth />}>
        <Route path="change-password" element={<PortalChangePasswordPage />} />
        <Route element={<RequirePortalUnlocked />}>
          <Route element={<SalesPortalLayout />}>
            <Route index element={<PortalIndexRedirect />} />

            <Route path="pipeline/:id" element={<PipelineDetailGate />} />

            <Route element={<RequireSalesRep />}>
              <Route path="pipeline" element={<PipelineListPage />} />
              <Route path="pipeline/new" element={<PipelineNewLeadPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="commission" element={<CommissionPage />} />
            </Route>

            <Route
              path="leads"
              element={<RoleAwareRedirect repTo="/portal/pipeline" adminTo="/portal/team" />}
            />
            <Route
              path="leads/*"
              element={<RoleAwareRedirect repTo="/portal/pipeline" adminTo="/portal/team" />}
            />
            <Route
              path="projects"
              element={<RoleAwareRedirect repTo="/portal/pipeline" adminTo="/portal/team" />}
            />
            <Route
              path="projects/*"
              element={<RoleAwareRedirect repTo="/portal/pipeline" adminTo="/portal/team" />}
            />
            <Route
              path="commissions"
              element={<RoleAwareRedirect repTo="/portal/commission" adminTo="/portal/team" />}
            />
            <Route
              path="approvals"
              element={<RoleAwareRedirect repTo="/portal/pipeline" adminTo="/portal/reviews" />}
            />
            <Route
              path="activity"
              element={<RoleAwareRedirect repTo="/portal/pipeline" adminTo="/portal/activity" />}
            />
            <Route
              path="exports"
              element={<RoleAwareRedirect repTo="/portal/pipeline" adminTo="/portal/settings" />}
            />

            <Route path="no-access" element={<NoAccessPage />} />
            <Route path="not-found" element={<NotFoundPage />} />

            <Route element={<RequireAdmin />}>
              <Route path="team" element={<TeamHubPage />} />
              <Route path="team/:repId" element={<RepProjectsPage />} />
              <Route path="team/:repId/projects/:leadId" element={<AdminProjectPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="payments" element={<PendingPaymentsPage />} />
              <Route path="activity" element={<ActivityLogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<PortalCatchAll />} />
    </Routes>
  );
}
