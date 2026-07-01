import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "../components/Reveal";
import heroStudio from "../assets/hero-studio.jpg";
import sanctuary from "../assets/sanctuary.jpg";
import journalTexture from "../assets/journal-texture.jpg";
import serviceCut from "../assets/service-cut.jpg";
import serviceColor from "../assets/service-color.jpg";
import serviceScalp from "../assets/service-scalp.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "L'Artiste — Unisex Hair & Beauty Atelier" },
      { name: "description", content: "A unisex collective focused on the architecture of hair and the chemistry of skin." },
      { property: "og:title", content: "L'Artiste — Unisex Hair & Beauty Atelier" },
      { property: "og:description", content: "A unisex collective for all identities." },
    ],
  }),
  component: HomePage,
});

const treatments = [
  { title: "Signature Sculpt", meta: "60 Min / Precise", price: "€85", img: serviceCut, alt: "Sculptural precision cut" },
  { title: "Botanic Color", meta: "120 Min / Organic", price: "€140", img: serviceColor, alt: "Botanic colour formulation", offset: true },
  { title: "Ritual Wash", meta: "45 Min / Zen", price: "€60", img: serviceScalp, alt: "Restorative scalp ritual" },
];

function HomePage() {
  return (
    <div className="bg-bone text-sage">
      {/* Hero */}
      <section className="relative min-h-[100svh] flex items-center pt-28 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full px-6 grid md:grid-cols-2 items-center gap-12 md:gap-16">
          <div className="z-10 hero-rise">
            <h1 className="text-6xl sm:text-7xl md:text-[9rem] font-serif italic leading-[0.85] mb-8 text-balance">
              Neutral <br />
              <span className="ml-10 md:ml-24 not-italic">Ground</span>
            </h1>
            <p className="max-w-sm text-sage/70 leading-relaxed font-light tracking-wide mb-10">
              A unisex collective for the architecture of hair and the chemistry of skin. Tailored craft for all identities.
            </p>
            <div className="flex items-center gap-6">
              <div className="h-px w-12 bg-sage/30" />
              <span className="text-[10px] uppercase tracking-[0.3em]">Est. 2024 — Berlin</span>
            </div>
          </div>
          <div className="relative hero-scale">
            <img
              src={heroStudio}
              width={1024}
              height={1280}
              alt="The L'Artiste studio interior"
              className="w-full aspect-[4/5] object-cover rounded-[40px] outline outline-1 -outline-offset-1 outline-black/5"
            />
          </div>
        </div>
      </section>

      {/* Ethos */}
      <Reveal as="section" className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-ochre mb-8 block">The Philosophy</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif leading-tight text-balance">
            We believe in grooming as a form of architecture. Precise, intentional, and entirely personal.
          </h2>
        </div>
      </Reveal>

      {/* Services preview */}
      <section className="py-24 bg-sand/20">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="flex justify-between items-end mb-16 gap-6">
            <h3 className="text-4xl sm:text-5xl font-serif leading-tight">
              Selected<br />Treatments
            </h3>
            <Link to="/services" className="text-[10px] uppercase tracking-[0.2em] text-sage/70 hover:text-ochre whitespace-nowrap shrink-0">
              View Full Menu →
            </Link>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {treatments.map((t, i) => (
              <Reveal key={t.title} delay={i * 120} className={`group ${t.offset ? "md:pt-12" : ""}`}>
                <div className="overflow-hidden mb-6 outline outline-1 -outline-offset-1 outline-black/5">
                  <img
                    src={t.img}
                    alt={t.alt}
                    loading="lazy"
                    width={768}
                    height={1024}
                    className="w-full aspect-[3/4] object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-serif mb-1">{t.title}</h4>
                    <p className="text-[10px] text-sage/60 uppercase tracking-[0.15em]">{t.meta}</p>
                  </div>
                  <span className="font-serif italic text-lg">{t.price}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sanctuary feature */}
      <Reveal as="section" className="overflow-hidden">
        <div className="relative h-[70vh] min-h-[480px] w-full">
          <img
            src={sanctuary}
            alt="A wide view of the salon lounge"
            loading="lazy"
            width={1600}
            height={1024}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-clay/20" />
          <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16">
            <span className="text-[10px] uppercase tracking-[0.4em] text-bone/80 mb-4 block">The Sanctuary</span>
            <h3 className="text-4xl md:text-6xl font-serif italic text-bone max-w-xl leading-tight">
              A still room in a loud city.
            </h3>
          </div>
        </div>
      </Reveal>

      {/* Journal */}
      <section className="py-28 md:py-40 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-24 items-center">
          <Reveal>
            <span className="text-[10px] uppercase tracking-[0.4em] text-ochre mb-6 block">Journal 012</span>
            <h3 className="text-4xl md:text-5xl font-serif mb-8 leading-tight text-balance">
              Understanding tonal harmony in colour.
            </h3>
            <p className="text-sage/70 mb-10 leading-relaxed font-light max-w-md">
              An exploration into the science of plant-based pigments and their interaction with diverse hair textures. A guide for the modern minimalist.
            </p>
            <Link to="/about" className="inline-block pb-1 border-b border-sage/40 text-[10px] uppercase tracking-[0.2em] hover:border-ochre transition-colors">
              Read the Journal
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <img
              src={journalTexture}
              alt="Hair texture editorial close-up"
              loading="lazy"
              width={1280}
              height={800}
              className="w-full aspect-[16/10] object-cover rounded-sm"
            />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
