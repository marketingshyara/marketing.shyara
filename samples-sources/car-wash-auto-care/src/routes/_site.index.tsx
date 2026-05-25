import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Wrench, ShieldCheck, Star, Phone, MessageCircle, Droplets, Award } from "lucide-react";
import hero from "@/assets/hero-wash.jpg";
import wash from "@/assets/service-wash.jpg";
import repair from "@/assets/service-repair.jpg";
import detail from "@/assets/service-detail.jpg";
import ceramic from "@/assets/service-ceramic.jpg";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Shyara Auto Care — Premium Car Wash & Repair" },
      { name: "description", content: "Shyara Auto Care delivers premium car wash, detailing and expert repair. Showroom-grade results, every visit." },
      { property: "og:title", content: "Shyara Auto Care — Premium Car Wash & Repair" },
      { property: "og:description", content: "Wash, detail and repair, done right." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden grain">
        <img
          src={hero}
          alt="Luxury car being washed at Shyara Auto Care"
          className="absolute inset-0 size-full object-cover md:scale-105"
          width={1600}
          height={1000}
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
          <div className="max-w-3xl">
            <div className="reveal inline-flex items-center gap-2 rounded-full border border-border bg-background/40 backdrop-blur px-4 py-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Trusted by 5,000+ drivers
            </div>
            <h1 className="reveal reveal-delay-1 mt-6 text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05]">
              Drive in dusty.
              <br />
              Drive out <span className="text-gradient">brilliant.</span>
            </h1>
            <p className="reveal reveal-delay-2 mt-6 text-lg text-muted-foreground max-w-xl">
              Shyara Auto Care blends meticulous detailing with expert repair —
              so your car always feels showroom new.
            </p>
            <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
              <a
                href="https://wa.me/919584661610?text=Hi%20Shyara%20Auto%20Care%2C%20I%27d%20like%20to%20book%20a%20service."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary focus-ring"
              >
                <MessageCircle className="size-4" /> Book on WhatsApp
              </a>
              <Link to="/services" className="btn-secondary focus-ring">
                Explore Services <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="reveal reveal-delay-4 mt-12 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg">
              {[
                { k: "12+", v: "Years experience" },
                { k: "50+", v: "Cars / week" },
                { k: "4.9★", v: "Customer rating" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="text-xl sm:text-3xl font-display font-bold text-gradient">{s.k}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-tight">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="reveal text-xs uppercase tracking-[0.25em] text-primary">Why Shyara</p>
            <h2 className="reveal reveal-delay-1 mt-3 text-4xl sm:text-5xl font-bold">
              The detail is in the details.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { icon: Droplets, title: "pH-balanced wash", desc: "Premium foam, gentle on paint, harsh on grime." },
              { icon: Wrench, title: "Expert repair", desc: "Certified mechanics, transparent diagnostics." },
              { icon: ShieldCheck, title: "100% safe", desc: "No swirl marks. No shortcuts. Just careful hands." },
            ].map((f, i) => (
              <div
                key={f.title}
                className={`reveal reveal-delay-${i + 1} group p-8 rounded-2xl bg-card border border-border hover-lift relative overflow-hidden`}
              >
                <div className="size-12 rounded-xl bg-gradient-brand grid place-items-center mb-5 group-hover:rotate-6 transition-transform">
                  <f.icon className="size-5 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-24 bg-surface relative overflow-hidden">
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <p className="reveal text-xs uppercase tracking-[0.25em] text-primary">What we do</p>
              <h2 className="reveal reveal-delay-1 mt-3 text-4xl sm:text-5xl font-bold max-w-xl">
                Care that covers every inch.
              </h2>
            </div>
            <Link
              to="/services"
              className="reveal reveal-delay-2 text-sm text-primary inline-flex items-center gap-2 hover:gap-3 transition-all focus-ring rounded-md"
            >
              View all services <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { img: wash, title: "Foam Wash", desc: "Snow-foam exterior + tyre shine." },
              { img: detail, title: "Interior Detail", desc: "Vacuum, shampoo, leather conditioning." },
              { img: ceramic, title: "Ceramic Coating", desc: "9H gloss, lasting up to 3 years." },
              { img: repair, title: "Repair & Service", desc: "Periodic maintenance & diagnostics." },
            ].map((s, i) => (
              <div
                key={s.title}
                className={`reveal-scale reveal-delay-${i + 1} group rounded-2xl overflow-hidden bg-card border border-border hover-lift`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    className="size-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="reveal text-xs uppercase tracking-[0.25em] text-primary">Our process</p>
            <h2 className="reveal reveal-delay-1 mt-3 text-4xl sm:text-5xl font-bold">
              Four steps to a brand-new shine.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {[
              { n: "01", t: "Book", d: "Ping us on WhatsApp or call." },
              { n: "02", t: "Inspect", d: "We walk the car with you." },
              { n: "03", t: "Care", d: "Wash, detail or repair — your call." },
              { n: "04", t: "Deliver", d: "Showroom-grade handover." },
            ].map((s, i) => (
              <div key={s.n} className={`reveal reveal-delay-${i + 1} relative p-6 rounded-2xl border border-border`}>
                <div className="text-5xl font-display font-bold text-gradient">{s.n}</div>
                <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="reveal text-xs uppercase tracking-[0.25em] text-primary text-center">Loved by drivers</p>
          <h2 className="reveal reveal-delay-1 mt-3 text-4xl sm:text-5xl font-bold text-center max-w-2xl mx-auto">
            Real shines. Real smiles.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "Aarav S.", c: "Booked their ceramic coating. Six months in, water still beads like day one." },
              { n: "Megha R.", c: "Honest diagnostics for my repair. Didn't push anything I didn't need." },
              { n: "Rohan K.", c: "The interior detail was unreal. Smelled and felt brand new." },
            ].map((t, i) => (
              <div key={t.n} className={`reveal reveal-delay-${i + 1} p-7 rounded-2xl bg-card border border-border`}>
                <div className="flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="size-4 fill-current" />)}
                </div>
                <p className="mt-4 text-foreground/90">"{t.c}"</p>
                <p className="mt-4 text-sm text-muted-foreground">— {t.n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="reveal-scale relative overflow-hidden rounded-3xl bg-gradient-brand p-10 sm:p-16 text-center shadow-glow">
            <Award className="size-10 mx-auto text-primary-foreground/80" />
            <h2 className="mt-4 text-3xl sm:text-5xl font-bold text-primary-foreground">
              Ready to make it shine?
            </h2>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Talk to us today — we'll recommend the perfect package for your ride.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 justify-center">
              <a href="tel:+919584661610" className="btn-secondary bg-background text-foreground focus-ring">
                <Phone className="size-4" /> Call 95846 61610
              </a>
              <a
                href="https://wa.me/919584661610"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary border-primary-foreground/30 text-primary-foreground bg-background/10 hover:bg-background/20 focus-ring"
              >
                <MessageCircle className="size-4" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
