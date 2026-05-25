import { createFileRoute } from "@tanstack/react-router";
import { Heart, Leaf, ShieldCheck, Users } from "lucide-react";
import about from "@/assets/about-shop.jpg";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About — Shyara Auto Care" },
      { name: "description", content: "The story, team and values behind Shyara Auto Care." },
      { property: "og:title", content: "About — Shyara Auto Care" },
      { property: "og:description", content: "A neighbourhood garage that grew into a premium auto-care studio." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="pt-36 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="reveal text-xs uppercase tracking-[0.25em] text-primary">Our story</p>
            <h1 className="reveal reveal-delay-1 mt-3 text-5xl sm:text-6xl font-bold leading-[1.05]">
              Built by <span className="text-gradient">car people,</span> for car people.
            </h1>
            <p className="reveal reveal-delay-2 mt-6 text-muted-foreground text-lg">
              Shyara started as a two-bay garage with one promise — treat every
              car like our own. A decade later, that promise still drives every
              wash, every wrench-turn, every handover.
            </p>
          </div>
          <div className="reveal-scale reveal-delay-2 relative">
            <div className="absolute -inset-4 bg-gradient-brand rounded-3xl blur-2xl opacity-30" />
            <img src={about} alt="Shyara Auto Care studio" loading="lazy" className="relative rounded-3xl border border-border shadow-card w-full" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="reveal text-4xl sm:text-5xl font-bold max-w-xl">
            What we stand by.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { i: Heart, t: "Care first", d: "Your car gets the same attention we'd give our own." },
              { i: ShieldCheck, t: "No shortcuts", d: "Quality products, careful hands, honest work." },
              { i: Leaf, t: "Water-wise", d: "Modern recycling cuts our wash water by 60%." },
              { i: Users, t: "Real people", d: "Speak to the same team every time you visit." },
            ].map((v, i) => (
              <div key={v.t} className={`reveal reveal-delay-${i + 1} p-7 rounded-2xl bg-card border border-border`}>
                <v.i className="size-7 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{v.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 grid sm:grid-cols-3 gap-8 text-center">
          {[
            { k: "12+", v: "Years on the road" },
            { k: "8,500+", v: "Happy customers" },
            { k: "4.9 ★", v: "Average rating" },
          ].map((s, i) => (
            <div key={s.v} className={`reveal reveal-delay-${i + 1}`}>
              <div className="text-5xl sm:text-6xl font-display font-bold text-gradient">{s.k}</div>
              <div className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">{s.v}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
