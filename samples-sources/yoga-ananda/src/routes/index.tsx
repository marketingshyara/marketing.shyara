import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Heart, Sun } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import hero from "@/assets/hero.jpg";
import studio from "@/assets/studio.jpg";
import community from "@/assets/community.jpg";
import classHatha from "@/assets/class-hatha.jpg";
import classVinyasa from "@/assets/class-vinyasa.jpg";
import classYin from "@/assets/class-yin.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ānanda — A Quiet Studio for Yoga" },
      { name: "description", content: "Hatha, Vinyasa, Yin and meditation classes in Portland." },
      { property: "og:title", content: "Ānanda — A Quiet Studio for Yoga" },
      { property: "og:description", content: "Hatha, Vinyasa, Yin and meditation classes in Portland." },
    ],
  }),
  component: Home,
});

function Home() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref}>
      {/* Hero */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <img
          src={hero}
          alt="Sunrise yoga practice"
          className="absolute inset-0 w-full h-full object-cover"
          width={1600}
          height={1100}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        <div className="container-x relative pb-20 md:pb-32 pt-32">
          <div data-reveal className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-foreground/70">Est. 2014 · Portland</span>
            <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl leading-[1.05] text-foreground">
              Find your<br />stillness.
            </h1>
            <p className="mt-6 max-w-md text-base md:text-lg text-foreground/70 leading-relaxed">
              A small studio for slow mornings, deep breath, and an honest practice.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/schedule"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-foreground text-background hover:bg-accent transition-colors"
              >
                View schedule
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/classes"
                className="inline-flex items-center px-7 py-3.5 rounded-full border border-foreground/30 text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                Our classes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 md:py-40">
        <div className="container-x grid md:grid-cols-12 gap-10 md:gap-16 items-end">
          <div data-reveal className="md:col-span-5">
            <span className="text-xs uppercase tracking-[0.3em] text-accent">A philosophy</span>
            <h2 className="mt-6 text-4xl md:text-5xl leading-tight">
              Practice is a return,<br />not a performance.
            </h2>
          </div>
          <div data-reveal className="md:col-span-6 md:col-start-7 text-muted-foreground leading-relaxed text-lg">
            <p>
              We teach a quiet, attentive style of yoga. No mirrors, no music to chase —
              just a warm room, soft light, and the breath you walked in with.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="pb-24 md:pb-32">
        <div className="container-x grid md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
          {[
            { icon: Leaf, title: "Slow", body: "Movement that meets you where you are, not where you think you should be." },
            { icon: Heart, title: "Honest", body: "Small classes, attentive teachers, no posing — only practice." },
            { icon: Sun, title: "Daily", body: "Open every morning at 6am, every evening until 9pm. Seven days." },
          ].map((p) => (
            <div data-reveal key={p.title} className="bg-card p-10 md:p-12">
              <p.icon size={24} className="text-accent" />
              <h3 className="mt-6 text-2xl">{p.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Studio image split */}
      <section className="py-24 md:py-32 bg-muted/40">
        <div className="container-x grid md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div data-reveal className="overflow-hidden rounded-2xl">
            <img src={studio} alt="Inside the studio" loading="lazy" className="w-full h-full object-cover aspect-[4/3]" width={1400} height={900} />
          </div>
          <div data-reveal>
            <span className="text-xs uppercase tracking-[0.3em] text-accent">The studio</span>
            <h2 className="mt-6 text-4xl md:text-5xl">A room that breathes with you.</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
              Reclaimed oak floors, tall arched windows, and only as much equipment as a practice asks for. Mats and props provided.
            </p>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-foreground border-b border-foreground/40 pb-1 hover:border-accent hover:text-accent transition-colors">
              About the space <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Class preview */}
      <section className="py-24 md:py-32">
        <div className="container-x">
          <div data-reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-accent">Classes</span>
              <h2 className="mt-4 text-4xl md:text-5xl">Find a practice.</h2>
            </div>
            <Link to="/classes" className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground">
              All classes <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: classHatha, name: "Hatha", desc: "Foundational, grounding, slow." },
              { img: classVinyasa, name: "Vinyasa", desc: "Breath-led flow, gently rising." },
              { img: classYin, name: "Yin", desc: "Long holds, soft surrender." },
            ].map((c) => (
              <Link
                to="/classes"
                key={c.name}
                data-reveal
                className="group block"
              >
                <div className="overflow-hidden rounded-xl aspect-[3/4] bg-muted">
                  <img src={c.img} alt={c.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" width={900} height={1100} />
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <h3 className="text-2xl">{c.name}</h3>
                  <span className="text-sm text-muted-foreground">{c.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-32 md:py-40">
        <div className="container-x max-w-3xl text-center">
          <p data-reveal className="font-serif text-3xl md:text-5xl leading-tight text-foreground">
            “Yoga is the journey of the self, through the self, to the self.”
          </p>
          <p data-reveal className="mt-6 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            The Bhagavad Gītā
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img src={community} alt="Group class" loading="lazy" className="absolute inset-0 w-full h-full object-cover" width={1400} height={900} />
        <div className="absolute inset-0 bg-foreground/55" />
        <div className="container-x relative py-28 md:py-40 text-center text-background">
          <h2 data-reveal className="text-4xl md:text-6xl">Your first week is on us.</h2>
          <p data-reveal className="mt-5 text-background/80 max-w-xl mx-auto">
            New students enjoy seven days of unlimited classes — no commitment.
          </p>
          <Link
            to="/schedule"
            data-reveal
            className="mt-10 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Begin your week <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
