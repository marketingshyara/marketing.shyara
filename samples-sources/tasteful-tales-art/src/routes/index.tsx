import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { SplitText } from "@/components/SplitText";
import { Parallax } from "@/components/Parallax";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import hero from "@/assets/hero.jpg";
import space from "@/assets/space.jpg";
import dishScallop from "@/assets/dish-scallop.jpg";
import dishRoots from "@/assets/dish-roots.jpg";
import dishCacao from "@/assets/dish-cacao.jpg";
import cellar from "@/assets/cellar.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "L'Éclipse — Culinary Sanctuary" },
      { name: "description", content: "An immersive dining experience where raw elements meet avant-garde technique." },
      { property: "og:title", content: "L'Éclipse — Culinary Sanctuary" },
      { property: "og:description", content: "Seasonal tasting menus, sourced within fifty miles, served in candlelight." },
    ],
  }),
  component: Home,
});

const signature = [
  { img: dishScallop, name: "Charred Scallop", note: "Kombu Butter · Emerald Oil", price: "32" },
  { img: dishRoots, name: "Winter Earth", note: "Heirloom Roots · Truffle Soil", price: "28" },
  { img: dishCacao, name: "Nocturne Cacao", note: "70% Dark · Smoked Sea Salt", price: "24" },
];

function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(heroProgress, [0, 1], [1, 0]);

  const cellarRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: cellarProgress } = useScroll({
    target: cellarRef,
    offset: ["start end", "end start"],
  });
  const cellarScale = useTransform(cellarProgress, [0, 1], [1.15, 1]);

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="relative flex h-[100svh] items-center justify-center overflow-hidden px-6">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <img
            src={hero}
            alt="Chef plating a dish in candlelight"
            width={1920}
            height={1080}
            className="h-full w-full object-cover opacity-50 hero-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian" />
        </motion.div>
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 block text-[10px] uppercase tracking-[0.5em] text-gold"
          >
            Est. MMXIV — London
          </motion.span>
          <SplitText
            as="h1"
            text="Poetry in Motion"
            delay={0.2}
            stagger={0.12}
            className="font-serif text-5xl italic leading-[0.95] sm:text-7xl md:text-9xl"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-8 max-w-md text-sm font-light leading-relaxed tracking-wide text-bone/80 md:text-base"
          >
            Where raw elements meet avant-garde technique. Deep in the heart of the city, we find silence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-col items-center gap-8"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/reserve"
                className="inline-block border border-bone/20 px-10 py-4 text-[10px] uppercase tracking-[0.35em] transition-all duration-500 hover:border-gold hover:bg-gold hover:text-obsidian"
              >
                Reserve a Table
              </Link>
            </motion.div>
            <div className="h-20 w-px bg-gradient-to-b from-gold/0 via-gold to-gold/0 shimmer" />
          </motion.div>
        </motion.div>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
          <Reveal>
            <Parallax className="aspect-[3/4] w-full" amount={120}>
              <img
                src={space}
                alt="Interior of L'Éclipse dining room"
                width={1000}
                height={1400}
                loading="lazy"
                className="h-[115%] w-full object-cover"
              />
            </Parallax>
          </Reveal>
          <Reveal delay={150}>
            <span className="mb-6 block text-xs uppercase tracking-[0.4em] text-gold">Our Philosophy</span>
            <h2 className="font-serif text-4xl leading-tight md:text-6xl">
              Honoring the<br />Unseen Elements
            </h2>
            <p className="mt-8 max-w-md leading-relaxed text-bone/60">
              True luxury lies in the subtraction of noise. We source exclusively from regenerative farms within a fifty-mile radius, letting each ingredient speak its quiet story of the soil.
            </p>
            <Link
              to="/story"
              className="mt-10 inline-block border border-bone/20 px-10 py-4 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 hover:border-gold hover:bg-gold hover:text-obsidian"
            >
              The Full Story
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Signature */}
      <section className="bg-ash px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-16 flex flex-col items-start justify-between gap-6 md:mb-20 md:flex-row md:items-end">
              <div>
                <h2 className="font-serif text-4xl italic md:text-5xl">Seasonal Curations</h2>
                <p className="mt-3 text-sm tracking-wide text-bone/40">Winter Equinox Menu — Issue 04</p>
              </div>
              <Link to="/menu" className="border-b border-gold/40 pb-1 text-[10px] uppercase tracking-[0.2em] text-gold">
                View Full Tasting Menu
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-3">
            {signature.map((d, i) => (
              <Reveal key={d.name} delay={i * 120}>
                <div className="group">
                  <div className="mb-6 aspect-square overflow-hidden bg-obsidian">
                    <img
                      src={d.img}
                      alt={d.name}
                      width={800}
                      height={800}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-serif text-2xl">{d.name}</h3>
                      <p className="mt-1 text-xs uppercase tracking-wider text-bone/40">{d.note}</p>
                    </div>
                    <span className="shrink-0 text-sm text-gold">${d.price}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Full bleed */}
      <section ref={cellarRef} className="relative h-[80vh] overflow-hidden">
        <motion.img
          style={{ scale: cellarScale }}
          src={cellar}
          alt="Candlelit dining cellar"
          width={1920}
          height={1000}
          loading="lazy"
          className="h-full w-full object-cover will-change-transform"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-obsidian/50 p-6 text-center">
          <Reveal>
            <h2 className="font-serif text-4xl italic md:text-6xl">The Art of Absence</h2>
            <p className="mt-4 text-[10px] uppercase tracking-[0.5em] text-gold">Reservations strictly recommended</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="mt-10 inline-block">
              <Link
                to="/reserve"
                className="inline-block border border-bone/30 px-10 py-4 text-[10px] uppercase tracking-[0.35em] transition-all duration-500 hover:border-gold hover:bg-gold hover:text-obsidian"
              >
                Reserve
              </Link>
            </motion.div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
