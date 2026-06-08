import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/classes", label: "Classes" },
  { to: "/schedule", label: "Schedule" },
  { to: "/instructors", label: "Instructors" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 md:h-20 items-center justify-between">
        <Link to="/" className={`font-serif text-2xl tracking-tight ${scrolled ? "text-foreground" : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"}`}>
          ānanda<span className="text-accent">.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm tracking-wide transition-colors ${
                scrolled
                  ? "text-foreground/70 hover:text-foreground"
                  : "text-white/90 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
              }`}
              activeProps={{ className: scrolled ? "text-foreground" : "text-white" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/schedule"
          className={`hidden md:inline-flex items-center px-5 py-2.5 rounded-full text-sm tracking-wide transition-colors ${
            scrolled
              ? "bg-foreground text-background hover:bg-accent"
              : "bg-white text-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          Book a class
        </Link>
        <button
          aria-label="Menu"
          className={`md:hidden p-2 ${scrolled ? "text-foreground" : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"}`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <nav className="container-x flex flex-col py-4 gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 text-foreground/80 hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/schedule"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex justify-center items-center px-5 py-3 rounded-full bg-foreground text-background"
            >
              Book a class
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
