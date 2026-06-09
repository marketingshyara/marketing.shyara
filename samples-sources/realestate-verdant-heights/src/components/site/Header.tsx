import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/residences", label: "Residences" },
  { to: "/amenities", label: "Amenities" },
  { to: "/gallery", label: "Gallery" },
  { to: "/location", label: "Location" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { location } = useRouterState();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open
          ? "bg-background/95 backdrop-blur-md border-b border-border/60 text-foreground"
          : "bg-gradient-to-b from-black/55 via-black/25 to-transparent text-white"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10 md:py-5">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-serif text-2xl md:text-3xl leading-none">
            Verdant<span className="text-gold">.</span>
          </span>
          <span className={`hidden sm:inline-block font-sans text-[10px] tracking-[0.3em] uppercase mt-2 ${scrolled || open ? "text-muted-foreground" : "text-white/70"}`}>
            Heights
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm tracking-wide transition-colors underline-link ${scrolled ? "text-foreground/80 hover:text-foreground" : "text-white/85 hover:text-white"}`}
              activeProps={{ className: scrolled ? "text-foreground" : "text-gold" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/contact"
          className={`hidden md:inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs tracking-widest uppercase transition-colors ${scrolled ? "bg-primary text-primary-foreground hover:bg-accent" : "bg-white text-primary hover:bg-gold hover:text-gold-foreground"}`}
        >
          Schedule visit
        </Link>

        <button
          className={`md:hidden p-2 ${scrolled || open ? "text-foreground" : "text-white"}`}
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-500 ease-out ${
          open ? "max-h-[480px]" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-5 pb-8 pt-2 gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="font-serif text-2xl py-2 text-foreground/90"
              activeProps={{ className: "text-gold" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-xs tracking-widest uppercase text-primary-foreground"
          >
            Schedule visit
          </Link>
        </nav>
      </div>
    </header>
  );
}
