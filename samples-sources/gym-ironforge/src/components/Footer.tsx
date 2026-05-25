import { Link } from "@tanstack/react-router";
import { Dumbbell, Instagram, Facebook, Youtube, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="container-x py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="size-9 grid place-items-center bg-gradient-ember rounded">
              <Dumbbell className="size-5 text-primary-foreground" strokeWidth={2.5} />
            </span>
            <span className="text-display text-lg tracking-widest font-bold">
              IRON<span className="text-primary">FORGE</span>
            </span>
          </div>
          <p className="mt-4 text-muted-foreground max-w-sm text-sm leading-relaxed">
            Forge a stronger version of yourself. Premium training, proven coaches, no shortcuts.
          </p>
          <div className="flex gap-3 mt-6">
            {[
              { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/" },
              { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/" },
              { Icon: Youtube, label: "YouTube", href: "https://www.youtube.com/" },
              { Icon: Twitter, label: "X", href: "https://x.com/" },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="size-10 grid place-items-center border border-border hover:border-primary hover:text-primary transition"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm tracking-widest text-primary mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
            <li><Link to="/programs" className="text-muted-foreground hover:text-foreground">Programs</Link></li>
            <li><Link to="/trainers" className="text-muted-foreground hover:text-foreground">Trainers</Link></li>
            <li><Link to="/schedule" className="text-muted-foreground hover:text-foreground">Schedule</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm tracking-widest text-primary mb-4">Visit</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>148 Iron Street</li>
            <li>Downtown District</li>
            <li>Mon–Fri  5:00 – 23:00</li>
            <li>Sat–Sun  7:00 – 21:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-x py-5 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} IronForge Gym. All rights reserved.</p>
          <p className="tracking-widest uppercase">Train. Forge. Repeat.</p>
        </div>
      </div>
    </footer>
  );
}
