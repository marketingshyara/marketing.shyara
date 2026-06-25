import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site-config";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "The Shop" },
  { to: "/about", label: "Our Story" },
  { to: "/visit", label: "Visit" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/5">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="size-8 bg-primary rounded-full grid place-items-center text-primary-foreground font-extrabold">
            P
          </div>
          <span className="font-extrabold tracking-tighter text-base sm:text-lg uppercase">{SITE.name}</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-[0.18em]">
          {links.slice(1, -1).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-primary transition-colors"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/visit"
            className="bg-foreground text-background px-5 py-2 rounded-full hover:bg-primary transition-colors"
          >
            Visit Us
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden size-10 grid place-items-center rounded-full border border-foreground/10"
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-5 bg-foreground transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-foreground transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-foreground/5 bg-background">
          <div className="px-5 py-6 flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-lg font-bold uppercase tracking-wider hover:text-primary"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
