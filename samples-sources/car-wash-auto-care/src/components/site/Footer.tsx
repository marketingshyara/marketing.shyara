import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, MapPin, Mail, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-gradient-brand grid place-items-center font-display font-bold text-primary-foreground">
              S
            </div>
            <div>
              <div className="font-display font-semibold">Shyara Auto Care</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Wash · Detail · Repair
              </div>
            </div>
          </div>
          <p className="mt-5 text-sm text-muted-foreground max-w-sm">
            Premium car wash and expert repair, delivered with showroom-grade
            care. Drive in dusty, drive out brilliant.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              aria-label="Instagram"
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="size-9 grid place-items-center rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
            >
              <Instagram className="size-4" />
            </a>
            <a
              aria-label="Facebook"
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="size-9 grid place-items-center rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
            >
              <Facebook className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li><Link to="/services" className="hover:text-foreground">Services</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/gallery" className="hover:text-foreground">Gallery</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4">Reach Us</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <a href="tel:+919584661610" className="flex items-center gap-2 hover:text-foreground">
                <Phone className="size-4 text-primary" /> +91 95846 61610
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/919584661610"
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 hover:text-foreground"
              >
                <MessageCircle className="size-4 text-primary" /> WhatsApp Chat
              </a>
            </li>
            <li>
              <a href="mailto:hello@shyaraautocare.in" className="flex items-center gap-2 hover:text-foreground">
                <Mail className="size-4 text-primary" /> hello@shyaraautocare.in
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="size-4 text-primary mt-0.5" /> Open Mon–Sun · 8 AM – 9 PM
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Shyara Auto Care. All rights reserved.</p>
          <p>Crafted for drivers who care.</p>
        </div>
      </div>
    </footer>
  );
}
