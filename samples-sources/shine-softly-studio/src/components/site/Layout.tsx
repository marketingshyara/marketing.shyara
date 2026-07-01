import { Header } from "./Header";
import { Footer } from "./Footer";
import { useReveal } from "@/hooks/use-reveal";
import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  useReveal();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
