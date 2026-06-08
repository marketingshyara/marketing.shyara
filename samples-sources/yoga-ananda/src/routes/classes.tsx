import { createFileRoute } from "@tanstack/react-router";
import { useReveal } from "@/hooks/use-reveal";
import classHatha from "@/assets/class-hatha.jpg";
import classVinyasa from "@/assets/class-vinyasa.jpg";
import classYin from "@/assets/class-yin.jpg";
import classMed from "@/assets/class-meditation.jpg";

export const Route = createFileRoute("/classes")({
  head: () => ({
    meta: [
      { title: "Classes — Ānanda Yoga" },
      { name: "description", content: "Hatha, Vinyasa, Yin, and meditation classes for every level." },
      { property: "og:title", content: "Classes — Ānanda Yoga" },
      { property: "og:description", content: "Hatha, Vinyasa, Yin, and meditation classes for every level." },
    ],
  }),
  component: ClassesPage,
});

const classes = [
  {
    img: classHatha,
    name: "Hatha",
    level: "All levels",
    minutes: 60,
    desc: "Held postures, longer breath. A foundational class to find balance and steadiness.",
  },
  {
    img: classVinyasa,
    name: "Vinyasa Flow",
    level: "Open",
    minutes: 75,
    desc: "Breath-paced sequencing that builds gentle heat, ending in stillness.",
  },
  {
    img: classYin,
    name: "Yin & Restore",
    level: "All levels",
    minutes: 75,
    desc: "Long passive holds with props. A practice for deep tissue and quiet evenings.",
  },
  {
    img: classMed,
    name: "Meditation",
    level: "Beginners welcome",
    minutes: 30,
    desc: "Guided sitting, breath work, and silence. A clear pause in the middle of the day.",
  },
];

function ClassesPage() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref}>
      <section className="pt-40 pb-20 md:pt-48 md:pb-28">
        <div className="container-x max-w-3xl">
          <span data-reveal className="text-xs uppercase tracking-[0.3em] text-accent">Classes</span>
          <h1 data-reveal className="mt-6 text-5xl md:text-7xl leading-[1.05]">A practice for every season.</h1>
          <p data-reveal className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Four lineages, taught honestly. Begin where you are — every class welcomes a first-timer.
          </p>
        </div>
      </section>

      <section className="pb-32">
        <div className="container-x space-y-16 md:space-y-28">
          {classes.map((c, i) => (
            <div
              key={c.name}
              data-reveal
              className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""}`}
            >
              <div className="overflow-hidden rounded-2xl">
                <img src={c.img} alt={c.name} loading="lazy" className="w-full aspect-[4/5] object-cover" width={900} height={1100} />
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {c.level} · {c.minutes} min
                </span>
                <h2 className="mt-4 text-4xl md:text-5xl">{c.name}</h2>
                <p className="mt-5 text-muted-foreground text-lg leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
