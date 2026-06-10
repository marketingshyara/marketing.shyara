import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import "@/styles/marketing.css";

export function MarketingLayout() {
  return (
    <div className="marketing-site flex min-h-screen flex-col bg-[#FAFAFA] text-[#0A0A0A]">
      <Navbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
