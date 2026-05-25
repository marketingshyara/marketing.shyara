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
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="container-x flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group focus-ring rounded-sm" onClick={close}>
            <span className="size-9 grid place-items-center bg-gradient-ember rounded shadow-ember transition-transform group-hover:scale-105">
              <Dumbbell className="size-5 text-primary-foreground" strokeWidth={2.5} />
            </span>
            <span className="text-display text-lg md:text-xl tracking-widest font-bold">
              IRON<span className="text-primary">FORGE</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="nav-link focus-ring rounded-sm"
                activeProps={{ className: "nav-link nav-link-active focus-ring rounded-sm" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link to="/contact" className="btn-primary hidden lg:inline-flex focus-ring">
            Join Now
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={MOBILE_NAV_ID}
            className="lg:hidden p-2.5 min-h-11 min-w-11 text-foreground focus-ring rounded-sm"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        <div
          id={MOBILE_NAV_ID}
          aria-hidden={!open}
          className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 bg-background/95 backdrop-blur-md border-b border-border ${
            open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <nav className="container-x flex flex-col py-4" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={close}
                className="py-3 text-base font-medium uppercase tracking-wider text-muted-foreground border-b border-border/50 last:border-0 focus-ring rounded-sm"
                activeProps={{
                  className:
                    "py-3 text-base font-medium uppercase tracking-wider text-primary border-b border-border/50 last:border-0 focus-ring rounded-sm",
                }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/contact" onClick={close} className="btn-primary mt-4 w-full focus-ring">
              Join Now
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
