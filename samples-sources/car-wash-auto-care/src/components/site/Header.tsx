import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";

const MOBILE_NAV_ID = "car-wash-mobile-nav";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group focus-ring rounded-lg" onClick={close}>
            <div className="size-9 rounded-lg bg-gradient-brand grid place-items-center font-display font-bold text-primary-foreground shadow-glow group-hover:scale-105 transition-transform">
              S
            </div>
            <div className="leading-tight">
              <div className="font-display font-semibold tracking-tight">Shyara</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Auto Care</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="nav-link focus-ring rounded-lg"
                activeProps={{ className: "nav-link nav-link-active focus-ring rounded-lg" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+919584661610" className="btn-primary focus-ring">
              <Phone className="size-4" />
              Book Now
            </a>
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={MOBILE_NAV_ID}
            className="md:hidden p-2.5 min-h-11 min-w-11 text-foreground focus-ring rounded-lg"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        <div
          id={MOBILE_NAV_ID}
          aria-hidden={!open}
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 bg-background/95 backdrop-blur-xl border-t border-border ${
            open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <nav className="px-4 py-4 flex flex-col gap-1" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={close}
                className="px-3 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors focus-ring"
                activeProps={{ className: "px-3 py-3 rounded-lg bg-secondary text-foreground font-medium focus-ring" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            <a href="tel:+919584661610" className="btn-primary mt-2 w-full focus-ring">
              <Phone className="size-4" /> Call 95846 61610
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
