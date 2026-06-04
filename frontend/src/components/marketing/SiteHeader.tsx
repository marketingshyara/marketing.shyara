import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Menu, MessageCircle, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { openWhatsApp, homeWhatsAppMessages } from "@/lib/whatsapp";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import { BrandLogo } from "@/components/marketing/BrandLogo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/samples", label: "Samples" },
  { href: "/contact", label: "Contact" },
];

function NavLink({
  href,
  label,
  active,
  className,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to={href}
      onClick={onClick}
      data-nav-link
      className={cn(
        "relative flex min-h-[40px] items-center justify-center rounded-full px-4 text-sm font-medium transition-colors duration-200",
        active
          ? "bg-card font-semibold text-foreground shadow-sm ring-1 ring-border/70"
          : "text-foreground/80 hover:bg-card/55 hover:text-foreground",
        className
      )}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const lastScrollY = useRef(0);
  const navHiddenRef = useRef(false);

  const isActive = (href: string) =>
    href === "/"
      ? location.pathname === "/"
      : location.pathname === href || location.pathname.startsWith(href + "/");

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /** GSAP entrance can leave inline opacity; reset on every route change. */
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    gsap.set(header.querySelectorAll("[data-nav-link], [data-nav-cta]"), {
      opacity: 1,
      clearProps: "opacity,y",
    });
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useGSAP(
    () => {
      const header = headerRef.current;
      const logo = logoRef.current;
      if (!header || !logo) return;

      if (!prefersReducedMotion()) {
        gsap.from(logo, {
          opacity: 0,
          x: -16,
          duration: 0.45,
          ease: "power3.out",
          clearProps: "opacity,x",
        });
        gsap.from(header.querySelectorAll("[data-nav-link], [data-nav-cta]"), {
          opacity: 0,
          y: -8,
          duration: 0.4,
          stagger: 0.06,
          delay: 0.1,
          ease: "power3.out",
          clearProps: "opacity,y",
        });
      }

      gsap.set(header, { y: 0 });

      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          setScrolled(y > 12);

          if (prefersReducedMotion()) return;

          const delta = y - lastScrollY.current;

          if (delta > 10 && y > 96 && !navHiddenRef.current) {
            navHiddenRef.current = true;
            gsap.to(header, {
              y: -80,
              duration: 0.3,
              ease: "power2.in",
              overwrite: "auto",
            });
          } else if (delta < -10 && navHiddenRef.current) {
            navHiddenRef.current = false;
            gsap.to(header, {
              y: 0,
              duration: 0.3,
              ease: "power2.out",
              overwrite: "auto",
            });
          }

          lastScrollY.current = y;
        },
      });

      return () => {
        st.kill();
        gsap.set(header, { clearProps: "y" });
        navHiddenRef.current = false;
      };
    },
    { scope: headerRef }
  );

  useGSAP(
    () => {
      const drawer = drawerRef.current;
      const links = linksRef.current;
      if (!drawer || !links) return;

      if (prefersReducedMotion()) return;

      if (mobileOpen) {
        gsap.fromTo(drawer, { opacity: 0 }, { opacity: 1, duration: 0.25 });
        gsap.from(links.querySelectorAll("[data-drawer-link]"), {
          opacity: 0,
          y: 20,
          duration: 0.35,
          stagger: 0.07,
          ease: "power3.out",
          delay: 0.05,
        });
      }
    },
    { dependencies: [mobileOpen], scope: drawerRef }
  );

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-[border-color,background-color,box-shadow] duration-300",
          scrolled
            ? "border-b border-border/50 bg-background/90 shadow-[0_1px_0_0_hsl(var(--border)/0.4),0_8px_24px_-8px_rgb(0_0_0/0.08)] backdrop-blur-lg"
            : "border-b border-transparent bg-background/55 backdrop-blur-md"
        )}
      >
        <div className="container relative flex h-16 items-center justify-between gap-4 md:h-[4.25rem]">
          <BrandLogo ref={logoRef} size="lg" className="z-10" />

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 md:flex"
            aria-label="Main navigation"
          >
            <div
              className={cn(
                "flex items-center gap-0.5 rounded-full border p-1 shadow-sm transition-colors duration-300",
                scrolled
                  ? "border-border/60 bg-card/75 backdrop-blur-sm"
                  : "border-border/50 bg-card/55 backdrop-blur-sm"
              )}
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  active={isActive(link.href)}
                />
              ))}
            </div>
          </nav>

          <div className="z-10 hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Button
              data-nav-cta
              onClick={() => openWhatsApp(homeWhatsAppMessages.hero)}
              className="h-10 min-h-[44px] gap-2 rounded-full bg-brand-coral px-5 text-white shadow-sm shadow-brand-coral/20 hover:bg-brand-coral/90"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              <span className="text-sm font-medium">Talk to Us</span>
            </Button>
          </div>

          <div className="z-10 flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 rounded-full"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-site-nav"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="h-16 md:h-[4.25rem]" aria-hidden />

      {mobileOpen && (
        <div
          ref={drawerRef}
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            aria-hidden
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-border/60 bg-background shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-border/50 px-5">
              <BrandLogo size="md" onClick={() => setMobileOpen(false)} />
              <Button
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11 rounded-full"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav
              id="mobile-site-nav"
              ref={linksRef}
              className="flex flex-1 flex-col gap-2 px-5 py-6"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  active={isActive(link.href)}
                  onClick={() => setMobileOpen(false)}
                  className="min-h-[48px] w-full justify-start rounded-xl px-5 text-base"
                />
              ))}
            </nav>

            <div className="border-t border-border/50 p-5">
              <Button
                data-drawer-link
                onClick={() => {
                  setMobileOpen(false);
                  openWhatsApp(homeWhatsAppMessages.hero);
                }}
                className="h-12 w-full gap-2 rounded-full bg-brand-coral text-white hover:bg-brand-coral/90"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                Talk to Us
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
