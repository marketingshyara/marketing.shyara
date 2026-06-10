import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Home from "./pages/Home";
import ServicesPage from "./pages/ServicesPage";
import WorkPage from "./pages/WorkPage";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import RefundPolicy from "./pages/legal/RefundPolicy";
import ServiceDeliveryPolicy from "./pages/legal/ServiceDeliveryPolicy";
import { ScrollToTop } from "./components/ScrollToTop";
import { SamplesLegacyRedirect } from "./components/marketing/SamplesLegacyRedirect";
import { MarketingLayout } from "./components/MarketingLayout";
import { SITE } from "./constants/site";

const PortalApp = lazy(() => import("./sales-portal/PortalApp"));

function PortalFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function ExternalRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);
  return null;
}

function WorkRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/work${search}`} replace />;
}

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/index.html" element={<Navigate to="/" replace />} />

        <Route path="/samples" element={<WorkRedirect />} />
        <Route path="/samples/social-media" element={<WorkRedirect />} />
        <Route path="/samples/websites" element={<SamplesLegacyRedirect />} />
        <Route
          path="/waiting"
          element={<Navigate to="/samples/websites/clinic-multispeciality-waiting-room/waiting" replace />}
        />
        <Route
          path="/waiting/*"
          element={<Navigate to="/samples/websites/clinic-multispeciality-waiting-room/waiting" replace />}
        />

        <Route path="/services/social-media" element={<Navigate to="/services" replace />} />
        <Route path="/services/ads-campaign-management" element={<Navigate to="/services" replace />} />
        <Route path="/services/website-development" element={<Navigate to="/services" replace />} />
        <Route path="/services/app-development" element={<Navigate to="/services" replace />} />
        <Route path="/contact" element={<ExternalRedirect url={SITE.whatsappUrl} />} />

        <Route
          path="/portal/*"
          element={
            <Suspense fallback={<PortalFallback />}>
              <PortalApp />
            </Suspense>
          }
        />

        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/service-delivery-policy" element={<ServiceDeliveryPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
