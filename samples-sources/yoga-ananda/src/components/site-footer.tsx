import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container-x py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-serif text-3xl">ānanda<span className="text-accent">.</span></div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
            A quiet studio for breath, movement, and stillness — open seven days a week.
          </p>
          <div className="mt-6 flex gap-4 text-muted-foreground">
            <a href="#" aria-label="Instagram" className="hover:text-foreground transition-colors"><Instagram size={18} /></a>
            <a href="#" aria-label="Facebook" className="hover:text-foreground transition-colors"><Facebook size={18} /></a>
            <a href="#" aria-label="YouTube" className="hover:text-foreground transition-colors"><Youtube size={18} /></a>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Explore</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/classes" className="hover:text-accent transition-colors">Classes</Link></li>
            <li><Link to="/schedule" className="hover:text-accent transition-colors">Schedule</Link></li>
            <li><Link to="/instructors" className="hover:text-accent transition-colors">Instructors</Link></li>
            <li><Link to="/about" className="hover:text-accent transition-colors">About</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Visit</div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>42 Linden Lane</li>
            <li>Portland, OR 97204</li>
            <li>hello@ananda.studio</li>
          </ul>
        </div>
      </div>
      <div className="container-x pb-8 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} Ānanda Yoga Studio</span>
        <span>Breathe. Move. Return.</span>
      </div>
    </footer>
  );
}
