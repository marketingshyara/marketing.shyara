import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { IMG } from "@/lib/images";
import { ArrowRight, Leaf, Home, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Verdant Heights — Premium Duplexes & Apartments in Bengaluru" },
      { name: "description", content: "A gated community of 2, 3 & 4 BHK homes and duplexes set within 14 acres of landscaped greenery." },
      { property: "og:title", content: "Verdant Heights" },
      { property: "og:description", content: "Premium 2, 3 & 4 BHK homes and duplexes in Bengaluru." },
      { property: "og:image", content: IMG.heroAerial },
    ],
  }),
  component: Home_,
});

function Home_() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        <img
          src={IMG.heroAerial}
          alt="Aerial view of Verdant Heights residential community"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-20 md:px-10 md:pb-28">
          <p className="reveal text-[11px] tracking-[0.4em] uppercase text-white/80">
            Now Launching · Phase I
          </p>
          <h1 className="reveal reveal-delay-1 mt-5 font-serif text-white text-5xl sm:text-6xl md:text-8xl leading-[0.95] max-w-4xl text-balance">
            Where the city <em className="text-gold not-italic">exhales</em>.
          </h1>
          <p className="reveal reveal-delay-2 mt-6 max-w-lg text-base md:text-lg text-white/85 leading-relaxed">
            Fourteen acres of forest, fourteen towers of light. A new society of
            duplexes and apartments in the heart of Whitefield.
          </p>
          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-4">
            <Link
              to="/residences"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-xs tracking-widest uppercase text-gold-foreground hover:opacity-90 transition"
            >
              Explore Residences <ArrowRight size={14} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-xs tracking-widest uppercase text-white hover:bg-white/10 transition"
            >
              Book a Site Visit
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {[
            ["14", "Acres of green"],
            ["320", "Premium homes"],
            ["28+", "Amenities"],
            ["75%", "Open landscape"],
          ].map(([k, v], i) => (
            <div key={k} className={`reveal reveal-delay-${i + 1} px-5 py-8 md:py-12 text-center`}>
              <div className="font-serif text-4xl md:text-5xl text-foreground">{k}</div>
              <div className="mt-2 text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-7xl px-5 md:px-10 py-24 md:py-40 grid md:grid-cols-12 gap-12 md:gap-20 items-center">
        <div className="md:col-span-5 reveal">
          <img
            src={IMG.exterior2}
            alt="Architectural facade of a duplex"
            className="w-full aspect-[4/5] object-cover rounded-sm"
          />
        </div>
        <div className="md:col-span-7 reveal reveal-delay-1">
          <p className="text-[11px] tracking-[0.4em] uppercase text-accent">The Vision</p>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-tight text-balance">
            A community designed around <em className="text-accent not-italic">light, air & quiet</em>.
          </h2>
          <p className="mt-8 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
            Verdant Heights is shaped by a single idea — that home should feel
            larger than its walls. Every residence opens onto the sky and a
            canopy of trees.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 gap-6 max-w-xl">
            {[
              [Leaf, "Net-zero landscape"],
              [Shield, "24×7 secure perimeter"],
              [Home, "Vaastu-aligned plans"],
              [Sparkles, "Hand-finished interiors"],
            ].map(([Icon, t], i) => (
              <div key={i} className="flex items-start gap-3">
                <Icon size={18} className="mt-0.5 text-gold" />
                <span className="text-sm">{t as string}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Residences preview */}
      <section className="bg-secondary/40 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="reveal">
              <p className="text-[11px] tracking-[0.4em] uppercase text-accent">Residences</p>
              <h2 className="mt-3 font-serif text-4xl md:text-6xl leading-tight max-w-2xl text-balance">
                Four configurations. <em className="text-gold not-italic">One philosophy.</em>
              </h2>
            </div>
            <Link to="/residences" className="reveal underline-link text-sm">
              View all configurations →
            </Link>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { img: IMG.interior1, type: "2 BHK", size: "1,180 sq ft", desc: "Compact comfort with full-height windows." },
              { img: IMG.interior2, type: "3 BHK", size: "1,640 sq ft", desc: "Family-scale homes with private balconies." },
              { img: IMG.interior4, type: "4 BHK", size: "2,210 sq ft", desc: "Sky residences with panoramic views." },
              { img: IMG.duplex1, type: "Duplex", size: "3,080 sq ft", desc: "Two-storey homes with private gardens." },
            ].map((r, i) => (
              <Link
                to="/residences"
                key={r.type}
                className={`reveal reveal-delay-${i + 1} group block`}
              >
                <div className="overflow-hidden rounded-sm aspect-[3/4] bg-muted">
                  <img
                    src={r.img}
                    alt={`${r.type} interior`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="pt-5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-2xl">{r.type}</h3>
                    <span className="text-xs text-muted-foreground tracking-wider">{r.size}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities teaser */}
      <section className="mx-auto max-w-7xl px-5 md:px-10 py-24 md:py-40 grid md:grid-cols-12 gap-12 md:gap-16 items-center">
        <div className="md:col-span-6 order-2 md:order-1 reveal">
          <p className="text-[11px] tracking-[0.4em] uppercase text-accent">Amenities</p>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-tight text-balance">
            A clubhouse, a forest, a <em className="text-gold not-italic">long pool</em>.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-lg">
            Twenty-eight curated amenities — from a 40-metre lap pool to a
            silent reading lounge — woven through the landscape.
          </p>
          <Link to="/amenities" className="mt-8 inline-flex items-center gap-2 text-sm underline-link">
            All amenities <ArrowRight size={14} />
          </Link>
        </div>
        <div className="md:col-span-6 order-1 md:order-2 grid grid-cols-2 gap-4">
          <img src={IMG.pool} alt="Lap pool" className="reveal aspect-[3/4] object-cover rounded-sm" />
          <img src={IMG.clubhouse} alt="Clubhouse" className="reveal reveal-delay-1 aspect-[3/4] object-cover rounded-sm mt-10" />
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img src={IMG.heroDuplex} alt="Twilight view of duplex homes" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative z-10 mx-auto max-w-4xl text-center px-5 md:px-10 py-28 md:py-40">
          <h2 className="reveal font-serif text-4xl md:text-6xl text-primary-foreground leading-tight text-balance">
            Walk through a home before it exists.
          </h2>
          <p className="reveal reveal-delay-1 mt-6 text-primary-foreground/80 max-w-xl mx-auto">
            Our experience centre features a full-scale 3 BHK and material
            samples from every residence.
          </p>
          <Link
            to="/contact"
            className="reveal reveal-delay-2 mt-10 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-xs tracking-widest uppercase text-gold-foreground"
          >
            Schedule a private tour <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
