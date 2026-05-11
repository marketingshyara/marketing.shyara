import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  PortalCatchAll,
  PublicLoginGate,
  RequireAdmin,
  RequireAuth,
  RequirePortalUnlocked
} from "./guards/PortalGuards";
import { SalesPortalLayout } from "./layout/SalesPortalLayout";
import { PortalLoginPage } from "./pages/PortalLoginPage";
import { PortalChangePasswordPage } from "./pages/PortalChangePasswordPage";
import { LeadsListPage } from "./pages/LeadsListPage";
import { LeadCreatePage } from "./pages/LeadCreatePage";
import { LeadDetailPage } from "./pages/LeadDetailPage";
import { UsersPage } from "./pages/UsersPage";
import { CommissionsPage } from "./pages/CommissionsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ActivityLogsPage } from "./pages/ActivityLogsPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ExportsPage } from "./pages/ExportsPage";
import { Button } from "@/components/ui/button";
import { ShieldAlert, SearchX } from "lucide-react";
import { getSafePortalReturnPath } from "./lib/sanitizeRedirect";

function NoAccessPage() {
  const location = useLocation();
  const from = getSafePortalReturnPath(
    "/portal/leads",
    (location.state as { from?: string } | null)?.from
  );
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
      <ShieldAlert className="h-10 w-10 text-amber-600" aria-hidden />
      <h1 className="text-2xl font-semibold">You Do Not Have Access</h1>
      <p className="text-sm text-muted-foreground">
        This section is only available to administrators. Ask an administrator if you need access.
      </p>
      <Button asChild className="min-h-11">
        <Link to={from}>Go Back</Link>
      </Button>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
      <SearchX className="h-10 w-10 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-semibold">Page Not Found</h1>
      <p className="text-sm text-muted-foreground">
        The page link is invalid or no longer available.
      </p>
      <Button asChild className="min-h-11">
        <Link to="/portal/leads">Go to Leads</Link>
      </Button>
    </div>
  );
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
            <Route index element={<Navigate to="leads" replace />} />
            <Route path="leads" element={<LeadsListPage />} />
            <Route path="leads/new" element={<LeadCreatePage />} />
            <Route path="leads/:id" element={<LeadDetailPage />} />
            <Route path="commissions" element={<CommissionsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="no-access" element={<NoAccessPage />} />
            <Route path="not-found" element={<NotFoundPage />} />
            <Route element={<RequireAdmin />}>
              <Route path="users" element={<UsersPage />} />
              <Route path="approvals" element={<ApprovalsPage />} />
              <Route path="activity" element={<ActivityLogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="exports" element={<ExportsPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<PortalCatchAll />} />
    </Routes>
  );
}
