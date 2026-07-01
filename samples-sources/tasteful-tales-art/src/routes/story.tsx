import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import chef from "@/assets/chef.jpg";
import fire from "@/assets/fire.jpg";
import herbs from "@/assets/herbs.jpg";
import space from "@/assets/space.jpg";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Story — L'Éclipse" },
      { name: "description", content: "A kitchen built on silence, fire, and the slow rhythm of the seasons." },
      { property: "og:title", content: "Story — L'Éclipse" },
      { property: "og:description", content: "Chef Henri Vasseur on the quiet pursuit of one perfect plate." },
      { property: "og:image", content: chef },
    ],
  }),
  component: StoryPage,
});

const principles = [
  { num: "01", title: "Proximity", text: "Every ingredient travels less than fifty miles to our door." },
  { num: "02", title: "Patience", text: "Some preparations begin three seasons before they are served." },
  { num: "03", title: "Restraint", text: "Three notes on a plate, never four. Subtraction is the discipline." },
];

function StoryPage() {
  return (
    <>
      <section className="relative h-[70svh] overflow-hidden">
        <img src={fire} alt="Open flame in the kitchen" className="h-full w-full object-cover opacity-60 hero-zoom" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian" />
        <div className="absolute inset-0 flex items-end px-6 pb-16 md:px-10 md:pb-24">
          <div className="mx-auto w-full max-w-7xl hero-entrance">
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold">Our Story</span>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl italic leading-[0.95] md:text-8xl">
              A quiet kitchen<br />in a loud city.
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
          <Reveal>
            <img src={chef} alt="Chef Henri Vasseur" loading="lazy" className="aspect-[4/5] w-full object-cover" />
          </Reveal>
          <Reveal delay={120}>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Chef Henri Vasseur</span>
            <h2 className="mt-6 font-serif text-4xl leading-tight md:text-5xl">
              The plate is<br /> the last sentence.
            </h2>
            <p className="mt-8 leading-relaxed text-bone/60">
              Trained in Lyon and seasoned across the kitchens of Copenhagen and San Sebastián, Henri opened L'Éclipse in 2014 with a simple intention — to cook only what the week made possible.
            </p>
            <p className="mt-4 leading-relaxed text-bone/60">
              The dining room seats twenty-eight. The kitchen brigade is twelve. Every shift begins with a half-hour of silence.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-ash px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="max-w-2xl font-serif text-4xl italic leading-tight md:text-6xl">Three Principles</h2>
          </Reveal>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {principles.map((p, i) => (
              <Reveal key={p.num} delay={i * 120}>
                <div className="border-t border-gold/40 pt-6">
                  <div className="font-serif text-sm text-gold">{p.num}</div>
                  <h3 className="mt-3 font-serif text-2xl">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-bone/55">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-24 md:grid-cols-2 md:px-10 md:py-32">
        <Reveal>
          <img src={herbs} alt="Foraged herbs and spices" loading="lazy" className="aspect-[4/3] w-full object-cover" />
        </Reveal>
        <Reveal delay={120}>
          <img src={space} alt="Interior detail" loading="lazy" className="aspect-[4/3] w-full object-cover" />
        </Reveal>
      </section>
    </>
  );
}
