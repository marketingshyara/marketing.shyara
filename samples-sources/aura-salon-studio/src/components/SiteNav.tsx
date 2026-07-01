import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const links = [
  { to: "/", label: "The Studio" },
  { to: "/services", label: "Services" },
  { to: "/team", label: "Artists" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "Journal" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-sage/5 nav-blur bg-bone/80">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-xl md:text-2xl font-serif tracking-[0.2em] font-semibold uppercase text-sage">
          L&apos;Artiste
        </Link>
        <div className="hidden md:flex gap-10 text-[10px] uppercase tracking-[0.2em] font-medium">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-ochre transition-colors text-sage"
              activeProps={{ className: "text-ochre" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          to="/contact"
          className="hidden md:flex h-10 w-32 border border-sage/25 items-center justify-center text-[10px] uppercase tracking-[0.2em] hover:bg-sage hover:text-bone transition-colors"
        >
          Book Now
        </Link>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span className={`block h-px w-6 bg-sage transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`block h-px w-6 bg-sage transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-6 bg-sage transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-bone border-t border-sage/10 px-6 py-10 flex flex-col gap-6 text-sm uppercase tracking-[0.2em]">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="text-sage hover:text-ochre"
              activeProps={{ className: "text-ochre" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}