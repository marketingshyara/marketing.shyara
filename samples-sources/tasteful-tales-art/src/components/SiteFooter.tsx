import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-bone/5 bg-obsidian px-6 py-20 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-serif text-3xl tracking-widest uppercase text-gold">L'Éclipse</div>
          <p className="mt-6 max-w-xs text-xs uppercase leading-loose tracking-[0.2em] text-bone/40">
            422 Midnight Lane<br />
            Industrial District<br />
            London, SE1 7PB
          </p>
        </div>
        <div>
          <h4 className="mb-6 text-[10px] uppercase tracking-[0.3em] text-gold">Explore</h4>
          <ul className="space-y-4 text-xs font-light text-bone/60">
            <li><Link to="/menu" className="transition-colors hover:text-bone">The Kitchen</Link></li>
            <li><Link to="/story" className="transition-colors hover:text-bone">Story</Link></li>
            <li><Link to="/gallery" className="transition-colors hover:text-bone">Gallery</Link></li>
            <li><Link to="/reserve" className="transition-colors hover:text-bone">Reserve</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-6 text-[10px] uppercase tracking-[0.3em] text-gold">Enquiries</h4>
          <p className="text-xs font-light leading-relaxed text-bone/60">
            concierge@leclipse.com<br />
            +44 20 7946 0122
          </p>
          <p className="mt-6 text-xs font-light leading-relaxed text-bone/60">
            Tue – Sat<br />
            18:00 – 23:00
          </p>
        </div>
      </div>
      <div className="mx-auto mt-20 flex max-w-7xl flex-col items-start justify-between gap-3 border-t border-bone/5 pt-8 text-[9px] uppercase tracking-[0.3em] text-bone/30 sm:flex-row sm:items-center">
        <span>© {new Date().getFullYear()} L'Éclipse Studio</span>
        <span>Crafted by Hand</span>
      </div>
    </footer>
  );
}
