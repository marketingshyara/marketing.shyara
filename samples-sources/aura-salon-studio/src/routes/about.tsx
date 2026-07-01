import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "../components/Reveal";
import aboutDetail from "../assets/about-detail.jpg";
import aboutCraft from "../assets/about-craft.jpg";
import sanctuary from "../assets/sanctuary.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Journal & Studio — L'Artiste" },
      { name: "description", content: "The story behind L'Artiste — a unisex studio devoted to craft, calm and considered design." },
      { property: "og:title", content: "Journal & Studio — L'Artiste" },
      { property: "og:description", content: "Our story, our materials, our method." },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  { label: "Material", body: "Plant-based pigments, mineral water rinses, organic textiles. Sourced for the skin, not the shelf." },
  { label: "Method", body: "Bone structure before silhouette. We map the face, then the cut. Always in that order." },
  { label: "Mood", body: "No music shouted, no perfumes layered. The studio is a quiet instrument; you are the note." },
];

function AboutPage() {
  return (
    <div className="bg-bone text-sage">
      <Reveal as="section" className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] text-ochre mb-8 block">Journal — Origin</span>
          <h1 className="text-5xl sm:text-7xl md:text-[7rem] font-serif italic leading-[0.9] text-balance">
            A small studio,<br />carefully kept.
          </h1>
        </div>
      </Reveal>

      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_1.2fr] gap-12 md:gap-24 items-center">
          <Reveal>
            <img src={aboutDetail} alt="Brass fixtures and oak counter" loading="lazy" width={1024} height={1280} className="w-full aspect-[4/5] object-cover" />
          </Reveal>
          <Reveal delay={150}>
            <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-8 text-balance">
              Founded in 2024 on a quiet street in Berlin, L&apos;Artiste began as four chairs and a single principle.
            </h2>
            <p className="text-sage/70 font-light leading-relaxed max-w-md">
              We refuse the language of haste. Our schedule is paced, our rooms are still, and our work is the unhurried opposite of fashion.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-32 px-6 bg-sand/30">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <span className="text-[10px] uppercase tracking-[0.4em] text-ochre mb-4 block">Three Pillars</span>
            <h3 className="text-4xl md:text-5xl font-serif mb-20 max-w-2xl leading-tight">
              What we keep,<br />and what we leave out.
            </h3>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {pillars.map((p, i) => (
              <Reveal key={p.label} delay={i * 120}>
                <span className="text-[10px] uppercase tracking-[0.3em] text-ochre mb-6 block">0{i + 1}</span>
                <h4 className="text-2xl font-serif italic mb-4">{p.label}</h4>
                <p className="text-sage/70 font-light leading-relaxed">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Reveal as="section" className="overflow-hidden">
        <img src={sanctuary} alt="The salon sanctuary" loading="lazy" width={1600} height={1024} className="w-full h-[60vh] min-h-[400px] object-cover" />
      </Reveal>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-24 items-center">
          <Reveal>
            <span className="text-[10px] uppercase tracking-[0.4em] text-ochre mb-6 block">The Craft</span>
            <h3 className="text-4xl md:text-5xl font-serif leading-tight mb-8 text-balance">
              We sharpen our own shears.
            </h3>
            <p className="text-sage/70 font-light leading-relaxed max-w-md mb-10">
              Every artist trains for three months before touching a guest&apos;s hair. Mastery is not the headline; it is the floor.
            </p>
            <Link to="/team" className="inline-block pb-1 border-b border-sage/40 text-[10px] uppercase tracking-[0.2em] hover:border-ochre">
              Meet the Artists
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <img src={aboutCraft} alt="Hands holding shears" loading="lazy" width={1024} height={1280} className="w-full aspect-[4/5] object-cover" />
          </Reveal>
        </div>
      </section>
    </div>
  );
}