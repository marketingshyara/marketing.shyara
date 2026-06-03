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
import shyaraLogo from "@/assets/shyara-logo.png";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/samples", label: "Samples" },
  { href: "/contact", label: "Contact" },
];

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
        gsap.from(logo, { opacity: 0, x: -16, duration: 0.45, ease: "power3.out" });
        gsap.from(header.querySelectorAll("[data-nav-item]"), {
          opacity: 0,
          y: -8,
          duration: 0.4,
          stagger: 0.06,
          delay: 0.1,
          ease: "power3.out",
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
              y: -72,
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
            ? "border-b border-border/60 bg-background/85 backdrop-blur-md shadow-sm"
            : "border-b border-transparent bg-background/70 backdrop-blur-sm"
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          <Link ref={logoRef} to="/" className="flex items-center gap-2">
            <img src={shyaraLogo} alt="Shyara" className="h-9 w-auto dark:invert" />
            <span className="text-xl font-display font-extrabold tracking-tight text-accent">Marketing</span>
          </Link>

          <nav className="hidden md:flex items-center gap-9" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-nav-item
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-accent px-1 py-1 min-h-[44px] flex items-center",
                  isActive(link.href)
                    ? "text-foreground after:absolute after:bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-brand-emerald after:rounded-full"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <div className="w-px h-4 bg-border" />
            <Button
              data-nav-item
              onClick={() => openWhatsApp(homeWhatsAppMessages.hero)}
              className="bg-brand-coral hover:bg-brand-coral/90 text-white gap-2 shadow-sm shadow-brand-coral/15 min-h-[44px]"
            >
              <MessageCircle className="h-4 w-4" />
              Talk to Us
            </Button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
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

      {/* Spacer for fixed header */}
      <div className="h-16" aria-hidden />

      {mobileOpen && (
        <div
          ref={drawerRef}
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div
            className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
            aria-hidden
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col bg-background pt-20 px-6 pb-8">
            <nav id="mobile-site-nav" ref={linksRef} className="flex flex-col gap-2 flex-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  data-drawer-link
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "text-lg font-medium min-h-[48px] flex items-center px-4 rounded-xl transition-colors",
                    isActive(link.href)
                      ? "text-foreground bg-brand-emerald/10 border-l-4 border-brand-emerald"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <Button
              data-drawer-link
              onClick={() => {
                setMobileOpen(false);
                openWhatsApp(homeWhatsAppMessages.hero);
              }}
              className="bg-brand-coral hover:bg-brand-coral/90 text-white gap-2 w-full min-h-[48px] mt-4"
            >
              <MessageCircle className="h-5 w-5" />
              Talk to Us
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
