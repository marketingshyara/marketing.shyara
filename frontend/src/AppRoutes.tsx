import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Samples from "./pages/Samples";
import SocialMediaSamplesPage from "./pages/SocialMediaSamplesPage";
import WebsiteSamplesPage from "./pages/WebsiteSamplesPage";
import SocialMediaService from "./pages/services/SocialMediaService";
import AdsCampaignService from "./pages/services/AdsCampaignService";
import WebsiteDevelopmentService from "./pages/services/WebsiteDevelopmentService";
import AppDevelopmentService from "./pages/services/AppDevelopmentService";
import Offers from "./pages/Offers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import RefundPolicy from "./pages/legal/RefundPolicy";
import ServiceDeliveryPolicy from "./pages/legal/ServiceDeliveryPolicy";
import { ScrollToTop } from "./components/ScrollToTop";

const PortalApp = lazy(() => import("./sales-portal/PortalApp"));

function PortalFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/social-media" element={<SocialMediaService />} />
        <Route path="/services/ads-campaign-management" element={<AdsCampaignService />} />
        <Route path="/services/website-development" element={<WebsiteDevelopmentService />} />
        <Route path="/services/app-development" element={<AppDevelopmentService />} />
        <Route path="/samples" element={<Samples />} />
        <Route path="/samples/social-media" element={<SocialMediaSamplesPage />} />
        <Route path="/samples/websites" element={<WebsiteSamplesPage />} />
        <Route path="/waiting" element={<Navigate to="/samples/websites/clinic-multispeciality-waiting-room/waiting" replace />} />
        <Route path="/waiting/*" element={<Navigate to="/samples/websites/clinic-multispeciality-waiting-room/waiting" replace />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/service-delivery-policy" element={<ServiceDeliveryPolicy />} />
        <Route
          path="/portal/*"
          element={
            <Suspense fallback={<PortalFallback />}>
              <PortalApp />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
