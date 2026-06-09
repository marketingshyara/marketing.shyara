import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { IMG } from "@/lib/images";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Verdant Heights" },
      { name: "description", content: "Architecture, interiors and amenities at Verdant Heights." },
      { property: "og:image", content: IMG.exterior1 },
    ],
  }),
  component: Gallery,
});

const groups: { tag: string; items: { src: string; alt: string; tall?: boolean }[] }[] = [
  {
    tag: "Architecture",
    items: [
      { src: IMG.exterior1, alt: "Tower facade with greenery", tall: true },
      { src: IMG.exterior3, alt: "Modern duplex exterior" },
      { src: IMG.exterior4, alt: "Building canopy detail" },
      { src: IMG.duplex2, alt: "Twilight duplex view", tall: true },
    ],
  },
  {
    tag: "Interiors",
    items: [
      { src: IMG.interior1, alt: "Living room" },
      { src: IMG.interior5, alt: "Open plan kitchen", tall: true },
      { src: IMG.interior3, alt: "Bedroom" },
      { src: IMG.interior6, alt: "Reading nook" },
      { src: IMG.living, alt: "Lounge" },
      { src: IMG.kitchen, alt: "Kitchen island", tall: true },
    ],
  },
  {
    tag: "Amenities",
    items: [
      { src: IMG.pool, alt: "Pool", tall: true },
      { src: IMG.gym, alt: "Gym" },
      { src: IMG.garden, alt: "Garden trail" },
      { src: IMG.clubhouse, alt: "Clubhouse interior" },
      { src: IMG.yoga, alt: "Yoga pavilion", tall: true },
      { src: IMG.playground, alt: "Children's play" },
    ],
  },
];

function Gallery() {
  return (
    <SiteLayout>
      <section className="pt-40 pb-12 md:pt-52 md:pb-20">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <p className="reveal text-[11px] tracking-[0.4em] uppercase text-accent">Gallery</p>
          <h1 className="reveal reveal-delay-1 mt-4 font-serif text-5xl md:text-7xl leading-[1] text-balance max-w-3xl">
            Look <em className="text-gold not-italic">around</em>.
          </h1>
        </div>
      </section>

      {groups.map((g) => (
        <section key={g.tag} className="mx-auto max-w-7xl px-5 md:px-10 pb-20 md:pb-28">
          <div className="reveal flex items-baseline justify-between border-b border-border pb-4 mb-8">
            <h2 className="font-serif text-2xl md:text-3xl">{g.tag}</h2>
            <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              {g.items.length} images
            </span>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 [column-fill:_balance]">
            {g.items.map((it, i) => (
              <div
                key={it.src}
                className={`reveal reveal-delay-${(i % 4) + 1} mb-4 md:mb-6 break-inside-avoid overflow-hidden rounded-sm group`}
              >
                <img
                  src={it.src}
                  alt={it.alt}
                  loading="lazy"
                  className={`w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105 ${
                    it.tall ? "aspect-[3/4]" : "aspect-[4/3]"
                  }`}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </SiteLayout>
  );
}
