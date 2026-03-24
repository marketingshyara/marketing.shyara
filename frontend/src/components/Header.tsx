import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import shyaraLogo from "@/assets/shyara-logo.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/samples", label: "Samples" },
  { href: "/offers", label: "Offers" },
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) =>
    href === "/"
      ? location.pathname === "/"
      : location.pathname === href || location.pathname.startsWith(href + "/");

  const openWhatsApp = () => {
    window.open(
      "https://wa.me/919584661610?text=Hi%20Shyara%20Marketing%2C%20I%20visited%20your%20website%20and%20I%27m%20interested%20in%20your%20services.%20Could%20you%20share%20more%20details%3F",
      "_blank"
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm shadow-card">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={shyaraLogo}
            alt="Shyara"
            className="h-9 w-auto dark:invert"
          />
          <span className="text-xl font-extrabold tracking-tight text-accent">Marketing</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-9">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "relative text-sm font-medium transition-colors hover:text-accent px-1 py-1",
                isActive(link.href)
                  ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent after:rounded-full"
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
            onClick={openWhatsApp}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 shadow-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Talk to Us
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] md:hidden"
            aria-hidden
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 md:hidden border-t border-border bg-background animate-slide-up shadow-elevated">
            <nav className="container py-5 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent min-h-[44px] flex items-center py-3 px-4 rounded-lg",
                  isActive(link.href)
                    ? "text-foreground bg-accent/5 border-l-4 border-accent"
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button
              onClick={openWhatsApp}
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 mt-4 w-full min-h-[44px]"
            >
              <MessageCircle className="h-4 w-4" />
              Talk to Us
            </Button>
          </nav>
          </div>
        </>
      )}
    </header>
  );
}
