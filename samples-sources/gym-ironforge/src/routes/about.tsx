import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { ArrowRight, Target, Heart, Compass } from "lucide-react";
import aboutHero from "@/assets/about-hero.jpg";
import community from "@/assets/community.jpg";
import facility from "@/assets/facility.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — IronForge Gym" },
      { name: "description", content: "Our story, philosophy, and the people behind IronForge." },
      { property: "og:title", content: "About IronForge" },
      { property: "og:description", content: "Premium training facility built by athletes, for athletes." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="relative h-[60svh] min-h-[420px] overflow-hidden pt-20">
        <img src={aboutHero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative container-x h-full flex flex-col justify-end pb-12">
          <Reveal>
            <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">— About</p>
            <h1 className="text-display text-5xl md:text-8xl">Built to <span className="text-primary">last.</span></h1>
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-28 container-x grid lg:grid-cols-2 gap-12 lg:gap-20">
        <Reveal>
          <h2 className="text-display text-3xl md:text-5xl">A gym built by lifters, <span className="text-primary">for lifters.</span></h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-muted-foreground leading-relaxed">
            IronForge started in 2017 with one barbell, one rack, and a simple belief — that training should be hard, structured, and personal. Eight years later, we've grown into a premium facility serving thousands of athletes, but the philosophy hasn't changed.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We don't sell fads. We coach fundamentals. Strength, capacity, longevity.
          </p>
        </Reveal>
      </section>

      <section className="py-20 md:py-28 bg-card">
        <div className="container-x">
          <Reveal>
            <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">— Principles</p>
            <h2 className="text-display text-4xl md:text-6xl">What we stand for.</h2>
          </Reveal>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Coaching first", text: "Every program is designed by certified coaches and adjusted to you." },
              { icon: Heart, title: "Longevity", text: "We train for the next 40 years, not the next 4 weeks." },
              { icon: Compass, title: "Direction", text: "Clear goals, structured plans, weekly check-ins." },
            ].map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="p-8 bg-background border border-border h-full">
                  <v.icon className="size-8 text-primary" />
                  <h3 className="text-display text-2xl mt-6">{v.title}</h3>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-20 md:py-28 grid lg:grid-cols-2 gap-6">
        <Reveal><img src={facility} alt="facility" loading="lazy" className="w-full h-full object-cover aspect-[4/3]" /></Reveal>
        <Reveal delay={0.1}><img src={community} alt="community" loading="lazy" className="w-full h-full object-cover aspect-[4/3]" /></Reveal>
      </section>

      <section className="container-x pb-24 text-center">
        <Reveal>
          <h2 className="text-display text-4xl md:text-6xl">Come see it for yourself.</h2>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 text-display tracking-widest px-8 py-5 bg-primary text-primary-foreground shadow-ember">
            Book a Tour <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
