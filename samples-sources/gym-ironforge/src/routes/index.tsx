import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Flame, Trophy, Users, Zap } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import hero from "@/assets/hero.jpg";
import facility from "@/assets/facility.jpg";
import strength from "@/assets/program-strength.jpg";
import boxing from "@/assets/program-boxing.jpg";
import hiit from "@/assets/program-hiit.jpg";
import functional from "@/assets/program-functional.jpg";
import community from "@/assets/community.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IronForge — Premium Strength & Conditioning Gym" },
      { name: "description", content: "Premium strength, conditioning, boxing and HIIT training. Elite coaches. Real results." },
      { property: "og:title", content: "IronForge — Forge a stronger you" },
      { property: "og:description", content: "Premium gym for strength, conditioning, boxing and HIIT." },
    ],
  }),
  component: Home,
});

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <img src={hero} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative h-full container-x flex flex-col justify-end pb-20 md:pb-32">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-sm md:text-base tracking-[0.4em] text-primary uppercase mb-4"
        >
          — Premium Training Facility
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-display font-bold text-[clamp(3rem,10vw,9rem)] leading-[0.9]"
        >
          Forge<br />
          Your <span className="text-primary">Limits</span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <Link to="/programs" className="inline-flex items-center gap-2 text-display tracking-widest px-6 py-4 bg-primary text-primary-foreground shadow-ember hover:brightness-110 transition">
            See Programs <ArrowRight className="size-4" />
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 text-display tracking-widest px-6 py-4 border border-border bg-background/40 backdrop-blur-sm hover:border-primary transition">
            Free Trial
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

const STATS = [
  { value: "12K+", label: "Members Trained" },
  { value: "25+", label: "Elite Coaches" },
  { value: "40+", label: "Weekly Classes" },
  { value: "8", label: "Years Strong" },
];

const PROGRAMS = [
  { title: "Strength", desc: "Build raw power with structured lifting.", img: strength, to: "/programs" as const },
  { title: "Boxing", desc: "Footwork, power, and conditioning.", img: boxing, to: "/programs" as const },
  { title: "HIIT", desc: "High intensity, maximum results.", img: hiit, to: "/programs" as const },
  { title: "Functional", desc: "Move better. Live stronger.", img: functional, to: "/programs" as const },
];

const VALUES = [
  { icon: Flame, title: "Intensity", text: "Earn every rep." },
  { icon: Trophy, title: "Results", text: "Measurable progress." },
  { icon: Users, title: "Community", text: "Train alongside athletes." },
  { icon: Zap, title: "Energy", text: "Atmosphere that drives you." },
];

function Home() {
  return (
    <>
      <Hero />

      {/* Marquee */}
      <div className="border-y border-border bg-card overflow-hidden py-6">
        <div className="flex gap-12 whitespace-nowrap animate-marquee w-max">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-12 items-center">
              {["Strength", "Conditioning", "Boxing", "HIIT", "Functional", "Recovery", "Nutrition"].map((w) => (
                <span key={w} className="text-display text-3xl md:text-5xl text-muted-foreground/40 tracking-widest">
                  {w} <span className="text-primary mx-4">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section className="py-20 md:py-28 container-x">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05} className="bg-background p-8 md:p-10">
              <div className="text-display text-5xl md:text-6xl text-primary">{s.value}</div>
              <div className="mt-2 text-sm tracking-widest uppercase text-muted-foreground">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 bg-card">
        <div className="container-x">
          <Reveal>
            <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">— Why IronForge</p>
            <h2 className="text-display text-4xl md:text-6xl max-w-3xl">No shortcuts. <span className="text-primary">No noise.</span> Just work.</h2>
          </Reveal>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="p-8 bg-background border border-border h-full hover:border-primary transition-colors">
                  <v.icon className="size-8 text-primary" />
                  <h3 className="text-display text-2xl mt-6">{v.title}</h3>
                  <p className="mt-2 text-muted-foreground text-sm">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 md:py-28 container-x">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <Reveal>
            <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">— Programs</p>
            <h2 className="text-display text-4xl md:text-6xl max-w-2xl">Built for every level.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link to="/programs" className="inline-flex items-center gap-2 text-display tracking-widest text-sm hover:text-primary transition">
              All Programs <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROGRAMS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.07}>
              <Link to={p.to} className="group block relative aspect-[3/4] overflow-hidden bg-card">
                <img src={p.img} alt={p.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-display text-2xl">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Facility split */}
      <section className="py-20 md:py-28 bg-card">
        <div className="container-x grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal>
            <div className="relative aspect-[5/4] overflow-hidden">
              <img src={facility} alt="Gym floor" loading="lazy" className="w-full h-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">— The Facility</p>
            <h2 className="text-display text-4xl md:text-5xl">A space built to <span className="text-primary">perform</span>.</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
              18,000 sq ft of competition-grade equipment, dedicated lifting platforms, a boxing zone, and recovery suites.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {["Olympic platforms", "Heavy bag area", "Sled & turf zone", "Recovery sauna", "Free parking", "24/7 access"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-1.5 bg-primary rounded-full" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/about" className="mt-10 inline-flex items-center gap-2 text-display tracking-widest text-sm hover:text-primary transition">
              About Us <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 container-x">
        <Reveal>
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">— Voices</p>
          <h2 className="text-display text-4xl md:text-6xl max-w-3xl">Real members. <span className="text-primary">Real wins.</span></h2>
        </Reveal>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {[
            { quote: "Lost 22kg in 8 months. The coaches actually care.", name: "Maya R.", role: "Member, 2 yrs" },
            { quote: "Deadlift PR up by 60kg. The programming is dialed.", name: "Daniel K.", role: "Member, 3 yrs" },
            { quote: "Best community I've trained with. Period.", name: "Sofia A.", role: "Member, 1 yr" },
          ].map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="p-8 bg-card border border-border h-full">
                <span className="text-display text-4xl text-primary leading-none">"</span>
                <blockquote className="mt-2 text-lg leading-snug">{t.quote}</blockquote>
                <figcaption className="mt-6 text-sm tracking-wider uppercase text-muted-foreground">
                  <span className="text-foreground">{t.name}</span> · {t.role}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={community} alt="" className="w-full h-full object-cover opacity-30" loading="lazy" />
          <div className="absolute inset-0 bg-background/70" />
        </div>
        <div className="relative container-x py-24 md:py-36 text-center">
          <Reveal>
            <h2 className="text-display text-5xl md:text-8xl leading-[0.9]">
              Stop waiting.<br /><span className="text-primary">Start lifting.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
              First session is on us. Step inside, meet a coach, and see what serious training feels like.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link to="/contact" className="mt-10 inline-flex items-center gap-2 text-display tracking-widest px-8 py-5 bg-primary text-primary-foreground shadow-ember hover:brightness-110 transition">
              Book Free Trial <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
