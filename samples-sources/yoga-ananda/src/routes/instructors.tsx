import { createFileRoute } from "@tanstack/react-router";
import { useReveal } from "@/hooks/use-reveal";
import i1 from "@/assets/instructor-1.jpg";
import i2 from "@/assets/instructor-2.jpg";
import i3 from "@/assets/instructor-3.jpg";

export const Route = createFileRoute("/instructors")({
  head: () => ({
    meta: [
      { title: "Instructors — Ānanda Yoga" },
      { name: "description", content: "Meet the teachers behind every class at Ānanda." },
      { property: "og:title", content: "Instructors — Ānanda Yoga" },
      { property: "og:description", content: "Meet the teachers behind every class at Ānanda." },
    ],
  }),
  component: InstructorsPage,
});

const team = [
  {
    img: i1,
    name: "Maya Linden",
    role: "Founder · Hatha & Yin",
    bio: "Maya opened Ānanda after a decade studying in Mysore. Her classes are quiet, precise, and unhurried.",
  },
  {
    img: i2,
    name: "Theo Marsh",
    role: "Meditation & Pranayama",
    bio: "Theo guides breath and silence. He trained in the Vipassana tradition and teaches with rare patience.",
  },
  {
    img: i3,
    name: "Iris Okafor",
    role: "Vinyasa Flow",
    bio: "Iris weaves musical, breath-led sequences. Expect to sweat a little and laugh once or twice.",
  },
];

function InstructorsPage() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref}>
      <section className="pt-40 pb-16 md:pt-48 md:pb-24">
        <div className="container-x max-w-3xl">
          <span data-reveal className="text-xs uppercase tracking-[0.3em] text-accent">Teachers</span>
          <h1 data-reveal className="mt-6 text-5xl md:text-7xl leading-[1.05]">The hands that hold the room.</h1>
          <p data-reveal className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Three teachers, one philosophy: small classes, real attention, honest practice.
          </p>
        </div>
      </section>

      <section className="pb-32">
        <div className="container-x grid md:grid-cols-3 gap-10 md:gap-8">
          {team.map((t) => (
            <article key={t.name} data-reveal className="group">
              <div className="overflow-hidden rounded-2xl aspect-[4/5]">
                <img src={t.img} alt={t.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" width={800} height={1000} />
              </div>
              <h2 className="mt-6 text-3xl">{t.name}</h2>
              <p className="text-sm uppercase tracking-widest text-accent mt-1">{t.role}</p>
              <p className="mt-4 text-muted-foreground leading-relaxed">{t.bio}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
