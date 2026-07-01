import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="py-20 border-t border-sage/10 bg-bone">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-[1.2fr_1fr_1fr] gap-12 md:gap-24">
          <div>
            <div className="text-3xl font-serif mb-6 italic text-sage">L&apos;Artiste</div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-sage/60 leading-loose">
              124 Torstraße, Berlin<br />
              Tue — Sat / 10:00 — 20:00<br />
              @lartiste_salon
            </p>
          </div>
          <div className="flex flex-col gap-4 text-[10px] uppercase tracking-[0.2em] text-sage/80">
            <Link to="/services" className="hover:text-ochre">Services</Link>
            <Link to="/team" className="hover:text-ochre">Artists</Link>
            <Link to="/gallery" className="hover:text-ochre">Gallery</Link>
            <Link to="/about" className="hover:text-ochre">Journal</Link>
            <Link to="/contact" className="hover:text-ochre">Contact</Link>
          </div>
          <div className="flex flex-col gap-4 text-[10px] uppercase tracking-[0.2em] text-sage/80">
            <a href="#" className="hover:text-ochre">Instagram</a>
            <a href="#" className="hover:text-ochre">Pinterest</a>
            <a href="#" className="hover:text-ochre">Vogue</a>
            <a href="#" className="hover:text-ochre">Careers</a>
          </div>
        </div>
        <div className="mt-16 pt-10 border-t border-sage/10 text-[9px] uppercase tracking-[0.4em] text-sage/40">
          © {new Date().getFullYear()} L&apos;Artiste Studio. A unisex collective.
        </div>
      </div>
    </footer>
  );
}