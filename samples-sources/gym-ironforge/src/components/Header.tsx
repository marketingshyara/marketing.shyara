import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Dumbbell } from "lucide-react";

const MOBILE_NAV_ID = "gym-mobile-nav";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/trainers", label: "Trainers" },
  { to: "/schedule", label: "Schedule" },
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

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container-x flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
          <span className="size-9 grid place-items-center bg-gradient-ember rounded shadow-ember">
            <Dumbbell className="size-5 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <span className="text-display text-lg md:text-xl tracking-widest font-bold">
            IRON<span className="text-primary">FORGE</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-4 py-2 text-sm font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors relative"
              activeProps={{ className: "px-4 py-2 text-sm font-medium uppercase tracking-wider text-foreground relative" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/contact"
          className="hidden lg:inline-flex items-center text-display text-sm tracking-widest px-5 py-2.5 bg-primary text-primary-foreground hover:brightness-110 transition shadow-ember"
        >
          Join Now
        </Link>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={MOBILE_NAV_ID}
          className="lg:hidden p-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      <div
        id={MOBILE_NAV_ID}
        aria-hidden={!open}
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 bg-background/95 backdrop-blur-md border-b border-border ${
          open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <nav className="container-x flex flex-col py-4">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="py-3 text-base font-medium uppercase tracking-wider text-muted-foreground border-b border-border/50 last:border-0"
              activeProps={{ className: "py-3 text-base font-medium uppercase tracking-wider text-primary border-b border-border/50 last:border-0" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex items-center justify-center text-display text-sm tracking-widest px-5 py-3 bg-primary text-primary-foreground"
          >
            Join Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
