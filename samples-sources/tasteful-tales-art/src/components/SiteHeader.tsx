import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/menu", label: "The Kitchen" },
  { to: "/story", label: "Story" },
  { to: "/gallery", label: "Gallery" },
  { to: "/reserve", label: "Reserve" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 nav-blur transition-colors duration-500",
        scrolled ? "bg-obsidian/70 border-b border-bone/5" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10">
        <Link to="/" className="flex min-w-0 flex-col" onClick={() => setOpen(false)}>
          <span className="font-serif text-xl tracking-[0.3em] uppercase text-gold md:text-2xl">L'Éclipse</span>
          <span className="hidden text-[10px] tracking-[0.3em] uppercase text-bone/50 sm:block">Culinary Sanctuary</span>
        </Link>
        <nav className="hidden gap-10 text-[11px] font-medium uppercase tracking-[0.22em] md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-bone/80 transition-colors hover:text-gold"
              activeProps={{ className: "text-gold" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex size-9 shrink-0 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span className={cn("h-px w-6 bg-bone transition-transform", open && "translate-y-[3px] rotate-45")} />
          <span className={cn("h-px w-6 bg-bone transition-transform", open && "-translate-y-[3px] -rotate-45")} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 top-[64px] z-40 bg-obsidian/95 nav-blur transition-opacity duration-500 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <nav className="flex flex-col items-center gap-8 px-6 py-16">
          {links.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="font-serif text-3xl italic text-bone transition-colors hover:text-gold"
              activeProps={{ className: "text-gold" }}
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.6s ${i * 60}ms, transform 0.6s ${i * 60}ms`,
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
