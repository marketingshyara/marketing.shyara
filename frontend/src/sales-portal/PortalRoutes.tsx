import { Navigate, Route, Routes } from "react-router-dom";
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
import { SettingsPage } from "./pages/SettingsPage";
import { ExportsPage } from "./pages/ExportsPage";

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
            <Route element={<RequireAdmin />}>
              <Route path="users" element={<UsersPage />} />
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
