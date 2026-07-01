import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "../components/Reveal";
import g1 from "../assets/gallery-1.jpg";
import g2 from "../assets/gallery-2.jpg";
import g3 from "../assets/gallery-3.jpg";
import g4 from "../assets/gallery-4.jpg";
import g5 from "../assets/gallery-5.jpg";
import g6 from "../assets/gallery-6.jpg";
import journalTexture from "../assets/journal-texture.jpg";
import sanctuary from "../assets/sanctuary.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — L'Artiste" },
      { name: "description", content: "A lookbook of recent work — cuts, colour studies, and texture craft." },
      { property: "og:title", content: "Gallery — L'Artiste" },
      { property: "og:description", content: "Recent work from the studio." },
    ],
  }),
  component: GalleryPage,
});

type Tile = { src: string; alt: string; caption: string; ratio: string; span?: string };

const tiles: Tile[] = [
  { src: g1, alt: "Sleek ponytail with caramel highlights", caption: "Tonal Highlight Study", ratio: "aspect-[4/5]" },
  { src: g5, alt: "Vintage scissors and comb on linen", caption: "Tools of the Trade", ratio: "aspect-[5/4]" },
  { src: g2, alt: "Sharp bob, side profile, sage backdrop", caption: "Sculpted Bob", ratio: "aspect-[5/4]" },
  { src: g6, alt: "Curly natural hair texture, golden light", caption: "Curl Architecture", ratio: "aspect-[4/5]" },
  { src: journalTexture, alt: "Editorial close-up of hair texture", caption: "Light Study, no. 04", ratio: "aspect-[5/4]" },
  { src: g3, alt: "Color brush against copper hair", caption: "Botanic Pigment Application", ratio: "aspect-[4/5]" },
  { src: g4, alt: "Man with textured side-part haircut", caption: "Textured Side-Part", ratio: "aspect-[4/5]" },
  { src: sanctuary, alt: "The studio sanctuary with olive tree", caption: "The Sanctuary, Room 02", ratio: "aspect-[5/4]" },
];

function GalleryPage() {
  return (
    <div className="bg-bone text-sage">
      <Reveal as="section" className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] text-ochre mb-8 block">Lookbook 24·25</span>
          <h1 className="text-5xl sm:text-7xl md:text-[7rem] font-serif italic leading-[0.9] text-balance max-w-5xl">
            Quiet work,<br />photographed<br />honestly.
          </h1>
        </div>
      </Reveal>

      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {tiles.map((t, i) => (
            <Reveal
              key={i}
              delay={(i % 3) * 100}
              className={`group ${i % 5 === 0 ? "sm:col-span-2 md:col-span-2" : ""} ${i % 4 === 0 ? "md:mt-12" : ""}`}
            >
              <div className="overflow-hidden outline outline-1 -outline-offset-1 outline-black/5">
                <img
                  src={t.src}
                  alt={t.alt}
                  loading="lazy"
                  className={`w-full ${t.ratio} object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]`}
                />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-sage/60 mt-4">{t.caption}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}