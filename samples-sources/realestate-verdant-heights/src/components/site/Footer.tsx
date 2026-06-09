import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 md:px-10 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="font-serif text-4xl md:text-5xl leading-tight text-balance">
              A new chapter of <span className="text-gold italic">living well</span>.
            </h3>
            <p className="mt-6 text-sm text-primary-foreground/70 max-w-md leading-relaxed">
              Verdant Heights is a gated community of premium duplexes and apartments
              surrounded by 14 acres of landscaped greenery.
            </p>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary-foreground/50 mb-4">
              Explore
            </p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/residences" className="underline-link">Residences</Link></li>
              <li><Link to="/amenities" className="underline-link">Amenities</Link></li>
              <li><Link to="/gallery" className="underline-link">Gallery</Link></li>
              <li><Link to="/location" className="underline-link">Location</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary-foreground/50 mb-4">
              Sales Gallery
            </p>
            <address className="not-italic text-sm leading-relaxed text-primary-foreground/80">
              Sector 27, Greenway Avenue<br />
              Whitefield, Bengaluru 560066<br />
              <span className="text-primary-foreground">+91 80 4567 8900</span><br />
              hello@verdantheights.in
            </address>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary-foreground/15 flex flex-col sm:flex-row justify-between gap-4 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Verdant Heights Developers Pvt. Ltd.</p>
          <p>RERA Reg. PRM/KA/RERA/1251/000/PR/220104</p>
        </div>
      </div>
    </footer>
  );
}
