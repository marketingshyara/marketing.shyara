import { Link } from "@tanstack/react-router";
import { Scissors, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 mt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <span className="font-display text-xl">Ironside &amp; Co.</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
            A modern barbershop rooted in old-world craft. Sharp cuts, hot towels, and quiet rituals since 2012.
          </p>
          <div className="flex gap-3 mt-6">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social"
                className="h-9 w-9 grid place-items-center border border-border hover:border-primary hover:text-primary transition-colors"
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.24em] text-primary mb-4">Visit</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            42 Holloway Lane<br />Brooklyn, NY 11211<br />+1 (212) 555-0142
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.24em] text-primary mb-4">Hours</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tue – Fri · 10–20<br />Saturday · 9–18<br />Sun – Mon · Closed
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Ironside &amp; Co. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
