import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { IMG } from "@/lib/images";
import {
  Waves, Dumbbell, Trees, Users, Baby, Flower2,
  BookOpen, Bike, Coffee, Music, Film, Utensils,
} from "lucide-react";

export const Route = createFileRoute("/amenities")({
  head: () => ({
    meta: [
      { title: "Amenities — Verdant Heights" },
      { name: "description", content: "28+ amenities across 14 acres — clubhouse, pool, gym, gardens, and more." },
      { property: "og:title", content: "Amenities — Verdant Heights" },
      { property: "og:image", content: IMG.pool },
    ],
  }),
  component: Amenities,
});

const featured = [
  { img: IMG.pool, title: "40-metre Lap Pool", desc: "A temperature-controlled pool with a separate kids' shallow." },
  { img: IMG.clubhouse, title: "The Clubhouse", desc: "32,000 sq ft of double-height lounges, dining and event spaces." },
  { img: IMG.gym, title: "Strength & Cardio", desc: "Equipped with Technogym and a dedicated functional zone." },
  { img: IMG.garden, title: "Forest Walk", desc: "A 1.2 km looped trail through native flowering trees." },
];

const grid = [
  { icon: Waves, label: "Lap Pool" },
  { icon: Waves, label: "Kids' Pool" },
  { icon: Dumbbell, label: "Gymnasium" },
  { icon: Users, label: "Coworking Lounge" },
  { icon: Baby, label: "Crèche" },
  { icon: Baby, label: "Children's Play" },
  { icon: Flower2, label: "Meditation Garden" },
  { icon: Trees, label: "Forest Trail" },
  { icon: BookOpen, label: "Reading Room" },
  { icon: Bike, label: "Cycling Loop" },
  { icon: Coffee, label: "Members' Café" },
  { icon: Music, label: "Music Room" },
  { icon: Film, label: "Screening Room" },
  { icon: Utensils, label: "Private Dining" },
  { icon: Users, label: "Yoga Pavilion" },
  { icon: Users, label: "Squash Court" },
];

function Amenities() {
  return (
    <SiteLayout>
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10 grid md:grid-cols-12 gap-12 items-end">
          <div className="md:col-span-7">
            <p className="reveal text-[11px] tracking-[0.4em] uppercase text-accent">Amenities</p>
            <h1 className="reveal reveal-delay-1 mt-4 font-serif text-5xl md:text-7xl leading-[1] text-balance">
              A community of <em className="text-gold not-italic">small luxuries</em>.
            </h1>
          </div>
          <p className="md:col-span-5 reveal reveal-delay-2 text-muted-foreground leading-relaxed">
            Twenty-eight amenities, distributed so no resident is more than
            ninety seconds from a place to swim, read, or stretch.
          </p>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-5 md:px-10 pb-24 md:pb-32 grid md:grid-cols-2 gap-8 md:gap-12">
        {featured.map((f, i) => (
          <article key={f.title} className={`reveal reveal-delay-${(i % 4) + 1} group`}>
            <div className="overflow-hidden rounded-sm aspect-[4/3]">
              <img src={f.img} alt={f.title} className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
            </div>
            <h3 className="mt-6 font-serif text-2xl md:text-3xl">{f.title}</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">{f.desc}</p>
          </article>
        ))}
      </section>

      {/* Grid of all */}
      <section className="bg-secondary/40 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <h2 className="reveal font-serif text-3xl md:text-5xl text-balance max-w-2xl">
            Everything within a short walk.
          </h2>
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border rounded-sm overflow-hidden">
            {grid.map(({ icon: Icon, label }, i) => (
              <div
                key={label + i}
                className={`reveal reveal-delay-${(i % 4) + 1} bg-background p-7 md:p-9 flex flex-col items-start gap-4 hover:bg-secondary transition-colors`}
              >
                <Icon size={22} className="text-gold" strokeWidth={1.4} />
                <span className="font-serif text-lg leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
