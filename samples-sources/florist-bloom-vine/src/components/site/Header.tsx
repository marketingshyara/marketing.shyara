import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/journal", label: "Journal" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/60"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="group flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="font-serif text-2xl tracking-tight">Bloom &amp; Vine</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">

          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="group relative text-sm tracking-wide text-foreground/70 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              <span>{l.label}</span>
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>


        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-foreground transition-colors hover:bg-secondary md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      <div
        className={`overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-md transition-[max-height] duration-500 md:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-6 py-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: l.to === "/" }}
              className="border-b border-border/40 py-3 font-serif text-xl text-foreground/80"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
