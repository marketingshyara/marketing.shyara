import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { MarketingSmoothScroll } from "@/components/marketing/motion/MarketingSmoothScroll";
import { CursorTracker } from "@/components/marketing/motion/CursorTracker";
import "@/styles/marketing.css";

export function MarketingLayout() {
  return (
    <MarketingSmoothScroll>
      <div className="marketing-site flex min-h-screen flex-col bg-[#FAFAFA] text-[#0A0A0A]">
        <CursorTracker />
        <Navbar />
        <main id="main-content" className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </MarketingSmoothScroll>
  );
}
