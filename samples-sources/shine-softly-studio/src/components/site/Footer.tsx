import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-24 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="font-display text-3xl">
            Maison<span className="text-accent">.</span>
          </Link>
          <p className="mt-5 max-w-sm text-primary-foreground/70 text-sm leading-relaxed">
            A unisex atelier for considered hair. Cut, color, grooming and care for all, practiced with patience in a quiet corner of the city.
          </p>
          <div className="mt-6 flex gap-4">
            <a href="#" aria-label="Instagram" className="p-2 border border-primary-foreground/20 hover:border-accent hover:text-accent transition">
              <Instagram size={16} />
            </a>
            <a href="#" aria-label="Facebook" className="p-2 border border-primary-foreground/20 hover:border-accent hover:text-accent transition">
              <Facebook size={16} />
            </a>
            <a href="#" aria-label="Email" className="p-2 border border-primary-foreground/20 hover:border-accent hover:text-accent transition">
              <Mail size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-primary-foreground/50">Visit</h4>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80">
            14 Linden Lane<br />
            Brooklyn, NY 11201<br />
            Tue–Sat · 10—19
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-primary-foreground/50">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/services" className="text-primary-foreground/80 hover:text-accent">Services</Link></li>
            <li><Link to="/gallery" className="text-primary-foreground/80 hover:text-accent">Gallery</Link></li>
            <li><Link to="/about" className="text-primary-foreground/80 hover:text-accent">About</Link></li>
            <li><Link to="/contact" className="text-primary-foreground/80 hover:text-accent">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Maison Hair Atelier. All rights reserved.</p>
          <p>Crafted with care.</p>
        </div>
      </div>
    </footer>
  );
}
