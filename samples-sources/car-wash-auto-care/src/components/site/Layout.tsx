import { Outlet } from "@tanstack/react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingContact } from "./FloatingContact";
import { useReveal } from "@/hooks/use-reveal";

export function SiteLayout() {
  useReveal();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a href="#main-content" className="skip-link focus-ring">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
}
