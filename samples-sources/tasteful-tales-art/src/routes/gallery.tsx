import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import hero from "@/assets/hero.jpg";
import space from "@/assets/space.jpg";
import dishScallop from "@/assets/dish-scallop.jpg";
import dishRoots from "@/assets/dish-roots.jpg";
import dishCacao from "@/assets/dish-cacao.jpg";
import cellar from "@/assets/cellar.jpg";
import chef from "@/assets/chef.jpg";
import fire from "@/assets/fire.jpg";
import wine from "@/assets/wine.jpg";
import herbs from "@/assets/herbs.jpg";
import oysters from "@/assets/oysters.jpg";
import beef from "@/assets/beef.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — L'Éclipse" },
      { name: "description", content: "Fragments of evenings past — the room, the flame, the plate." },
      { property: "og:title", content: "Gallery — L'Éclipse" },
      { property: "og:description", content: "Fragments of evenings past." },
      { property: "og:image", content: cellar },
    ],
  }),
  component: GalleryPage,
});

const items = [
  { src: hero, alt: "Chef plating", span: "md:col-span-2 md:row-span-2", aspect: "aspect-square" },
  { src: oysters, alt: "Oysters", aspect: "aspect-[4/5]" },
  { src: fire, alt: "Open flame", aspect: "aspect-[4/5]" },
  { src: dishScallop, alt: "Scallop", aspect: "aspect-square" },
  { src: cellar, alt: "Cellar dining", span: "md:col-span-2", aspect: "aspect-[16/9]" },
  { src: wine, alt: "Pouring wine", aspect: "aspect-[3/4]" },
  { src: dishRoots, alt: "Heirloom roots", aspect: "aspect-square" },
  { src: chef, alt: "Chef portrait", aspect: "aspect-[4/5]" },
  { src: beef, alt: "Aged beef", aspect: "aspect-square" },
  { src: herbs, alt: "Foraged herbs", span: "md:col-span-2", aspect: "aspect-[16/10]" },
  { src: space, alt: "Dining room", aspect: "aspect-[3/4]" },
  { src: dishCacao, alt: "Dark chocolate dessert", aspect: "aspect-square" },
];

function GalleryPage() {
  return (
    <>
      <section className="px-6 pb-16 pt-40 text-center md:px-10 md:pb-24 md:pt-48">
        <Reveal>
          <span className="text-[10px] uppercase tracking-[0.5em] text-gold">Visual Journal</span>
          <h1 className="mt-6 font-serif text-5xl italic md:text-8xl">Gallery</h1>
          <p className="mx-auto mt-8 max-w-lg text-bone/55">Fragments of evenings past — the room, the flame, the plate.</p>
        </Reveal>
      </section>

      <section className="px-6 pb-32 md:px-10">
        <div className="mx-auto grid max-w-7xl auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-4 md:gap-5">
          {items.map((it, i) => (
            <Reveal
              key={i}
              delay={(i % 4) * 80}
              className={`group relative overflow-hidden ${it.span ?? ""}`}
            >
              <img
                src={it.src}
                alt={it.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-obsidian/0 transition-colors duration-500 group-hover:bg-obsidian/30" />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
