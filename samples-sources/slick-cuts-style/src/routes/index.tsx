import { createFileRoute, Link } from "@tanstack/react-router";
import { useRevealAll } from "@/hooks/use-reveal";
import { ArrowRight, Scissors, Sparkles, Clock } from "lucide-react";
import hero from "@/assets/hero.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import about from "@/assets/about.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ironside & Co. — Modern Barbershop in Brooklyn" },
      { name: "description", content: "Sharp cuts, hot towel shaves and quiet rituals. A modern barbershop rooted in old-world craft." },
    ],
  }),
  component: Home,
});

function Home() {
  useRevealAll();
  return (
    <main>
      {/* HERO */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
        <img src={hero} alt="Ironside barbershop interior" className="absolute inset-0 h-full w-full object-cover ken-burns" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/40 to-background" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 h-full flex flex-col justify-end pb-24 lg:pb-32">
          <span className="eyebrow reveal">Brooklyn · Est. 2012</span>
          <h1 className="reveal reveal-delay-1 mt-6 font-display text-6xl sm:text-7xl lg:text-[8rem] leading-[0.95] text-balance max-w-5xl">
            Old craft.<br /><span className="text-primary italic">New edge.</span>
          </h1>
          <p className="reveal reveal-delay-2 mt-8 max-w-md text-base text-muted-foreground leading-relaxed">
            A barbershop for men who care about the details. Hot towels, straight razors, and a quiet hour for yourself.
          </p>
          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-4">
            <Link to="/contact" className="btn-primary">Book a chair <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/services" className="btn-ghost">Our services</Link>
          </div>
        </div>
        <div className="absolute bottom-8 right-6 lg:right-10 z-10 hidden sm:flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground reveal reveal-delay-4">
          <span className="h-px w-10 bg-primary" /> Scroll
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-border bg-card/30 overflow-hidden py-6">
        <div className="marquee-track flex gap-16 whitespace-nowrap font-display text-3xl text-muted-foreground/70">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-16 items-center">
              <span>Classic Cuts</span><Scissors className="h-5 w-5 text-primary" />
              <span>Hot Towel Shave</span><Scissors className="h-5 w-5 text-primary" />
              <span>Beard Sculpting</span><Scissors className="h-5 w-5 text-primary" />
              <span>Father &amp; Son</span><Scissors className="h-5 w-5 text-primary" />
              <span>Grey Blending</span><Scissors className="h-5 w-5 text-primary" />
              <span>The Ironside Ritual</span><Scissors className="h-5 w-5 text-primary" />
            </div>
          ))}
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-28 lg:py-40 grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
        <div className="reveal">
          <img src={about} alt="The shop" className="w-full h-[520px] object-cover" loading="lazy" />
        </div>
        <div>
          <span className="eyebrow reveal">The Shop</span>
          <h2 className="reveal reveal-delay-1 mt-5 font-display text-4xl sm:text-5xl text-balance">
            Twelve years sharpening one simple idea.
          </h2>
          <p className="reveal reveal-delay-2 mt-6 text-muted-foreground leading-relaxed">
            We opened on a quiet block with two chairs, a Belmont mirror, and a bet that men still wanted craft over speed. The bet held.
          </p>
          <div className="reveal reveal-delay-3 mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
            <Stat n="12" l="Years" />
            <Stat n="6" l="Master barbers" />
            <Stat n="∞" l="Cups of coffee" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-28 lg:pb-40">
        <div className="grid gap-px bg-border md:grid-cols-3">
          {features.map((f, i) => (
            <div key={f.title} className={`reveal reveal-delay-${i + 1} bg-background p-10 lg:p-12 group hover:bg-card transition-colors`}>
              <f.Icon className="h-7 w-7 text-primary" strokeWidth={1.4} />
              <h3 className="mt-8 font-display text-2xl">{f.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY TEASE */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-28 lg:pb-40">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <div>
            <span className="eyebrow reveal">Recent Work</span>
            <h2 className="reveal reveal-delay-1 mt-4 font-display text-4xl sm:text-5xl">From the chair.</h2>
          </div>
          <Link to="/gallery" className="reveal reveal-delay-2 link-underline text-xs uppercase tracking-[0.24em]">
            View gallery
          </Link>
        </div>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[gallery1, gallery2, gallery3].map((src, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1} group overflow-hidden`}>
              <img
                src={src}
                alt=""
                loading="lazy"
                className="w-full aspect-[4/5] object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-28 lg:py-40 border-t border-border text-center">
          <span className="eyebrow reveal">Take a seat</span>
          <h2 className="reveal reveal-delay-1 mt-6 font-display text-5xl sm:text-6xl lg:text-7xl text-balance max-w-3xl mx-auto">
            The chair is warm. Walk in or book a slot.
          </h2>
          <div className="reveal reveal-delay-2 mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-primary">Book now <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/barbers" className="btn-ghost">Meet the barbers</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const features = [
  { Icon: Scissors, title: "Hand-cut, every time", desc: "No assembly line. Each cut is shaped by hand, scissor over comb, the way it should be." },
  { Icon: Sparkles, title: "The full ritual", desc: "Hot towels, warm lather, straight-razor finish. Forty minutes that feel like an evening." },
  { Icon: Clock, title: "Worth the wait", desc: "Walk-ins welcome, but appointments are honored to the minute. Your time is the product." },
];

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-4xl text-primary">{n}</div>
      <div className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">{l}</div>
    </div>
  );
}
