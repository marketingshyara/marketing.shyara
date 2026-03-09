import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Samples from "./pages/Samples";
import WebsiteSamplesPage from "./pages/WebsiteSamplesPage";
import SocialMediaSamplesPage from "./pages/SocialMediaSamplesPage";
import SocialMediaService from "./pages/services/SocialMediaService";
import AdsCampaignService from "./pages/services/AdsCampaignService";
import WebsiteDevelopmentService from "./pages/services/WebsiteDevelopmentService";
import AppDevelopmentService from "./pages/services/AppDevelopmentService";
import Offers from "./pages/Offers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import RefundPolicy from "./pages/legal/RefundPolicy";
import ServiceDeliveryPolicy from "./pages/legal/ServiceDeliveryPolicy";
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              <Route path="/waiting" element={<Navigate to="/samples/websites/clinic3v2/waiting" replace />} />
              <Route path="/waiting/*" element={<Navigate to="/samples/websites/clinic3v2/waiting" replace />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/service-delivery-policy" element={<ServiceDeliveryPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
