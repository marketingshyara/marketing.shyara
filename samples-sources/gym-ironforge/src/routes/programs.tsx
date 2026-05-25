import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { ArrowRight } from "lucide-react";
import strength from "@/assets/program-strength.jpg";
import boxing from "@/assets/program-boxing.jpg";
import hiit from "@/assets/program-hiit.jpg";
import functional from "@/assets/program-functional.jpg";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs — IronForge Gym" },
      { name: "description", content: "Strength, boxing, HIIT and functional training programs." },
      { property: "og:title", content: "IronForge Programs" },
      { property: "og:description", content: "Find the training program that matches your goals." },
    ],
  }),
  component: Programs,
});

const PROGRAMS = [
  {
    title: "Strength",
    tag: "Lift Heavy",
    img: strength,
    desc: "Periodized barbell programming for squat, bench, deadlift and press. Build raw strength with progressive overload, technical coaching, and weekly check-ins.",
    items: ["Coached lift sessions", "Custom programming", "Form video review", "Strength testing"],
  },
  {
    title: "Boxing",
    tag: "Hit Hard",
    img: boxing,
    desc: "Footwork, head movement, power and conditioning. Train with former competitive boxers in our dedicated boxing zone.",
    items: ["Pad work", "Heavy bag rounds", "Sparring (optional)", "Conditioning circuits"],
  },
  {
    title: "HIIT",
    tag: "Go All Out",
    img: hiit,
    desc: "45-minute high intensity classes mixing sleds, ropes, rowers and bodyweight. Burn fat, build capacity, stay sharp.",
    items: ["Small group format", "Heart-rate tracking", "Daily varying workouts", "All-levels scaling"],
  },
  {
    title: "Functional",
    tag: "Move Better",
    img: functional,
    desc: "Kettlebells, mobility, carries and crawls. Improve how your body moves through the world, every day.",
    items: ["Mobility flow", "Loaded carries", "Core stability", "Movement assessment"],
  },
];

function Programs() {
  return (
    <>
      <section className="pt-32 md:pt-40 pb-12 container-x">
        <Reveal>
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">— Programs</p>
          <h1 className="text-display text-5xl md:text-8xl max-w-4xl leading-[0.9]">
            Pick your <span className="text-primary">path.</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-xl">
            Four core disciplines, infinite ways to grow. Every program is coach-led and member-tailored.
          </p>
        </Reveal>
      </section>

      <section className="container-x pb-24 space-y-12 md:space-y-20">
        {PROGRAMS.map((p, i) => (
          <Reveal key={p.title}>
            <div className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${i % 2 ? "lg:[&>div:first-child]:order-2" : ""}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-card group">
                <img src={p.img} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute top-4 left-4 text-display tracking-widest text-xs px-3 py-1.5 bg-primary text-primary-foreground">
                  {p.tag}
                </span>
              </div>
              <div>
                <h2 className="text-display text-4xl md:text-6xl">{p.title}</h2>
                <p className="mt-5 text-muted-foreground leading-relaxed">{p.desc}</p>
                <ul className="mt-8 grid grid-cols-2 gap-3">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="size-1.5 bg-primary rounded-full" /> {it}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="mt-10 inline-flex items-center gap-2 text-display tracking-widest text-sm hover:text-primary transition">
                  Get Started <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="bg-card py-20 md:py-28">
        <div className="container-x text-center">
          <Reveal>
            <h2 className="text-display text-4xl md:text-6xl">Not sure where to start?</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">A 30-minute consult with one of our coaches will match you to the right program.</p>
            <Link to="/contact" className="mt-8 inline-flex items-center gap-2 text-display tracking-widest px-8 py-5 bg-primary text-primary-foreground shadow-ember">
              Talk to a Coach <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
