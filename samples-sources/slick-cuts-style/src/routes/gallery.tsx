import { createFileRoute } from "@tanstack/react-router";
import { Page, PageHero } from "@/components/site/Section";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import hero from "@/assets/hero.jpg";
import about from "@/assets/about.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Ironside & Co." },
      { name: "description", content: "Cuts, shaves and quiet moments from the chair." },
      { property: "og:title", content: "Gallery — Ironside & Co." },
      { property: "og:description", content: "Cuts, shaves and quiet moments from the chair." },
    ],
  }),
  component: Gallery,
});

const items = [
  { src: g1, span: "lg:row-span-2", label: "Skin fade" },
  { src: g2, span: "", label: "Hot towel" },
  { src: g3, span: "", label: "Beard sculpt" },
  { src: g4, span: "lg:col-span-2", label: "The tools" },
  { src: g5, span: "lg:row-span-2", label: "Neckline" },
  { src: hero, span: "", label: "After hours" },
  { src: g6, span: "lg:col-span-2", label: "The room" },
  { src: about, span: "", label: "Wall of clients" },
];

function Gallery() {
  return (
    <Page>
      <PageHero
        eyebrow="Gallery"
        title="The work, the room, the quiet."
        image={g6}
      />
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 auto-rows-[260px] sm:auto-rows-[300px] lg:auto-rows-[280px]">
          {items.map((it, i) => (
            <figure
              key={i}
              className={`reveal reveal-delay-${(i % 4) + 1} relative overflow-hidden group ${it.span}`}
            >
              <img
                src={it.src}
                alt={it.label}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <figcaption className="absolute bottom-4 left-4 text-[0.7rem] uppercase tracking-[0.24em] text-cream translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                {it.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </Page>
  );
}
