import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { IMG } from "@/lib/images";
import { ArrowRight, Bed, Bath, Maximize2 } from "lucide-react";

export const Route = createFileRoute("/residences")({
  head: () => ({
    meta: [
      { title: "Residences — Verdant Heights" },
      { name: "description", content: "Explore 2, 3, 4 BHK apartments and signature duplexes at Verdant Heights." },
      { property: "og:title", content: "Residences — Verdant Heights" },
      { property: "og:image", content: IMG.exterior1 },
    ],
  }),
  component: Residences,
});

const homes = [
  {
    type: "2 BHK",
    tag: "Garden Suites",
    size: "1,180 – 1,260 sq ft",
    beds: 2, baths: 2, balconies: 2,
    img: IMG.interior3,
    desc: "Designed for first homes and quiet retreats. Full-height glazing and a north-facing balcony bring the canopy indoors.",
    features: ["Modular Italian kitchen", "Wide-plank engineered oak floors", "Smart climate control"],
  },
  {
    type: "3 BHK",
    tag: "Family Residences",
    size: "1,640 – 1,820 sq ft",
    beds: 3, baths: 3, balconies: 2,
    img: IMG.interior2,
    desc: "Generous family layouts with a separate utility wing, study nook and dual-aspect living room.",
    features: ["Private master suite with walk-in", "Powder room for guests", "Servant entry & utility"],
  },
  {
    type: "4 BHK",
    tag: "Sky Residences",
    size: "2,210 – 2,480 sq ft",
    beds: 4, baths: 4, balconies: 3,
    img: IMG.interior4,
    desc: "Upper-floor residences with panoramic balconies wrapping two sides. Designed for entertaining and long evenings in.",
    features: ["Wrap-around sky deck", "Home theatre wiring", "Two reserved parking bays"],
  },
  {
    type: "Duplex",
    tag: "Signature Duplexes",
    size: "3,080 – 3,640 sq ft",
    beds: 4, baths: 5, balconies: 4,
    img: IMG.duplex1,
    desc: "Two-storey homes with private gardens or terraces. An internal courtyard and double-height living room define each plan.",
    features: ["Private plunge pool option", "Internal staircase in steel & oak", "Dedicated lift access"],
  },
];

function Residences() {
  return (
    <SiteLayout>
      {/* Page hero */}
      <section className="relative pt-40 pb-16 md:pt-52 md:pb-24 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <p className="reveal text-[11px] tracking-[0.4em] uppercase text-accent">Residences</p>
          <h1 className="reveal reveal-delay-1 mt-4 font-serif text-5xl md:text-7xl leading-[1] max-w-4xl text-balance">
            Four ways to live. <em className="text-gold not-italic">One sense of home.</em>
          </h1>
          <p className="reveal reveal-delay-2 mt-6 max-w-xl text-muted-foreground">
            From compact garden suites to two-storey duplexes, every plan is
            drawn around natural light, cross-ventilation and quiet corners.
          </p>
        </div>
      </section>

      {/* Residence rows */}
      <div className="mx-auto max-w-7xl px-5 md:px-10 py-20 md:py-28 space-y-28 md:space-y-40">
        {homes.map((h, i) => (
          <article
            key={h.type}
            className={`grid gap-10 md:gap-16 md:grid-cols-12 items-center ${
              i % 2 ? "md:[&>.media]:order-2" : ""
            }`}
          >
            <div className="media md:col-span-7 reveal">
              <div className="overflow-hidden rounded-sm">
                <img
                  src={h.img}
                  alt={`${h.type} ${h.tag}`}
                  className="w-full aspect-[4/3] object-cover hover:scale-[1.03] transition-transform duration-[1200ms]"
                />
              </div>
            </div>
            <div className="md:col-span-5 reveal reveal-delay-1">
              <p className="text-[11px] tracking-[0.4em] uppercase text-accent">{h.tag}</p>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">{h.type}</h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">{h.desc}</p>

              <div className="mt-7 grid grid-cols-3 gap-4 text-center border-y border-border py-5">
                <Spec icon={<Bed size={16} />} label="Beds" value={h.beds} />
                <Spec icon={<Bath size={16} />} label="Baths" value={h.baths} />
                <Spec icon={<Maximize2 size={16} />} label="Size" value={h.size.split(" ")[0]} small />
              </div>

              <ul className="mt-6 space-y-2.5 text-sm">
                {h.features.map((f) => (
                  <li key={f} className="flex gap-3 text-foreground/80">
                    <span className="mt-2 h-1 w-1 rounded-full bg-gold flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-2 text-sm underline-link"
              >
                Request the floor plan <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Comparison */}
      <section className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-10">
          <h2 className="reveal font-serif text-3xl md:text-5xl text-balance">At a glance</h2>
          <div className="reveal reveal-delay-1 mt-10 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-primary-foreground/60 text-[10px] tracking-[0.25em] uppercase border-b border-primary-foreground/20">
                <tr>
                  <th className="py-4 pr-4">Configuration</th>
                  <th className="py-4 pr-4">Carpet area</th>
                  <th className="py-4 pr-4">Bedrooms</th>
                  <th className="py-4 pr-4">Balconies</th>
                  <th className="py-4">Starting from*</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-foreground/15">
                {homes.map((h) => (
                  <tr key={h.type}>
                    <td className="py-5 pr-4 font-serif text-lg">{h.type}</td>
                    <td className="py-5 pr-4">{h.size}</td>
                    <td className="py-5 pr-4">{h.beds}</td>
                    <td className="py-5 pr-4">{h.balconies}</td>
                    <td className="py-5 text-gold">On request</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-[10px] uppercase tracking-widest text-primary-foreground/40">
              *Inclusive of one covered parking. Government charges extra.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Spec({ icon, label, value, small }: { icon: React.ReactNode; label: string; value: string | number; small?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 text-muted-foreground">{icon}<span className="text-[10px] tracking-widest uppercase">{label}</span></div>
      <div className={`mt-1 font-serif ${small ? "text-base" : "text-xl"}`}>{value}</div>
    </div>
  );
}
