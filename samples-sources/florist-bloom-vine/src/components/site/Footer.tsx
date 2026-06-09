import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4 md:px-10">
        <div className="md:col-span-2">
          <h3 className="font-serif text-3xl">Bloom &amp; Vine</h3>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A small studio florist arranging seasonal stems for everyday rituals,
            slow mornings, and tender milestones.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-lg">Visit</h4>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            14 Linden Lane<br />
            Portland, OR 97209<br />
            Tue – Sat · 10–6
          </p>
        </div>

        <div>
          <h4 className="font-serif text-lg">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/shop" className="text-muted-foreground hover:text-foreground">Shop</Link></li>
            <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
            <li><Link to="/journal" className="text-muted-foreground hover:text-foreground">Journal</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
          </ul>
          <div className="mt-5 flex gap-3 text-foreground/70">
            <a href="#" aria-label="Instagram" className="rounded-full p-2 transition-colors hover:bg-background hover:text-foreground"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Facebook" className="rounded-full p-2 transition-colors hover:bg-background hover:text-foreground"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="Email" className="rounded-full p-2 transition-colors hover:bg-background hover:text-foreground"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-7xl px-6 py-6 text-xs text-muted-foreground md:px-10">
          © {new Date().getFullYear()} Bloom &amp; Vine. Grown with care.
        </p>
      </div>
    </footer>
  );
}
