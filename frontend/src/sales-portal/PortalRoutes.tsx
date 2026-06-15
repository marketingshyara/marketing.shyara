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
import { NotInterestedLeadsPage } from "./pages/pipeline/NotInterestedLeadsPage";
import { ResourcesPage } from "./pages/resources/ResourcesPage";
import { ReviewsPage } from "./pages/admin/ReviewsPage";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { TeamHubPage } from "./pages/admin/TeamHubPage";
import { RepProjectsPage } from "./pages/admin/RepProjectsPage";
import { AdminProjectPage } from "./pages/admin/AdminProjectPage";
import { UsersPage } from "./pages/UsersPage";
import { AllProjectsPage } from "./pages/admin/AllProjectsPage";
import { ActivityLogsPage } from "./pages/admin/ActivityLogsPage";
import { PendingPaymentsPage } from "./pages/admin/PendingPaymentsPage";
import { CommissionPage } from "./pages/CommissionPage";
import { LeadScraperPage } from "./pages/lead-scraper/LeadScraperPage";
import { BrutalButton } from "./components/brutalist";
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
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 border-2 border-[#0A0A0A] bg-white p-8 text-center shadow-[4px_4px_0_0_#0A0A0A]">
      <ShieldAlert className="h-10 w-10 text-[#FF3333]" aria-hidden />
      <h1 className="font-heading text-2xl font-black uppercase tracking-tight">You do not have access</h1>
      <p className="text-sm text-[#0A0A0A]/60">
        This section is only available to administrators.
      </p>
      <BrutalButton asChild>
        <Link to={from}>Go back</Link>
      </BrutalButton>
    </div>
  );
}

function NotFoundPage() {
  const { data } = useSessionQuery();
  const home = defaultPortalHome(data?.user?.role ?? "SALES_REP");
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 border-2 border-[#0A0A0A] bg-white p-8 text-center shadow-[4px_4px_0_0_#0A0A0A]">
      <SearchX className="h-10 w-10 text-[#0A0A0A]/40" aria-hidden />
      <h1 className="font-heading text-2xl font-black uppercase tracking-tight">Page not found</h1>
      <BrutalButton asChild>
        <Link to={home}>Go to home</Link>
      </BrutalButton>
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

            <Route path="commission" element={<CommissionPage />} />

            <Route element={<RequireSalesRep />}>
              <Route path="pipeline" element={<PipelineListPage />} />
              <Route path="pipeline/not-interested" element={<NotInterestedLeadsPage />} />
              <Route path="pipeline/new" element={<PipelineNewLeadPage />} />
              <Route path="lead-scraper" element={<LeadScraperPage />} />
              <Route path="resources" element={<ResourcesPage />} />
            </Route>

            <Route path="pipeline/:id" element={<PipelineDetailGate />} />

            <Route
              path="leads"
              element={<RoleAwareRedirect repTo="/portal/pipeline" adminTo="/portal/team" />}
            />
            <Route
              path="leads/*"
              element={<RoleAwareRedirect repTo="/portal/pipeline" adminTo="/portal/team" />}
            />
            <Route
              path="commissions"
              element={<LegacyRedirect to="/portal/commission" />}
            />
            <Route
              path="approvals"
              element={<RoleAwareRedirect repTo="/portal/pipeline" adminTo="/portal/reviews" />}
            />
            <Route
              path="exports"
              element={<RoleAwareRedirect repTo="/portal/pipeline" adminTo="/portal/settings" />}
            />

            <Route path="no-access" element={<NoAccessPage />} />
            <Route path="not-found" element={<NotFoundPage />} />

            <Route element={<RequireAdmin />}>
              <Route path="projects" element={<AllProjectsPage />} />
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
