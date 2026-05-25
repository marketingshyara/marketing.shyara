import { createFileRoute } from "@tanstack/react-router";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import hero from "@/assets/hero-wash.jpg";
import ceramic from "@/assets/service-ceramic.jpg";
import detail from "@/assets/service-detail.jpg";

export const Route = createFileRoute("/_site/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Shyara Auto Care" },
      { name: "description", content: "A look at the cars we've cared for at Shyara Auto Care." },
      { property: "og:title", content: "Gallery — Shyara Auto Care" },
      { property: "og:description", content: "Real shines. Real cars. Our work in pictures." },
    ],
  }),
  component: Gallery,
});

const shots: { src: string; alt: string; tall?: boolean }[] = [
  { src: g1, alt: "Glossy blue SUV", tall: true },
  { src: hero, alt: "Foam wash" },
  { src: g2, alt: "Alloy detail" },
  { src: g3, alt: "Snow foam", tall: true },
  { src: detail, alt: "Interior detailing" },
  { src: g4, alt: "Engine bay" },
  { src: g5, alt: "Headlight restoration", tall: true },
  { src: ceramic, alt: "Ceramic coating" },
  { src: g6, alt: "Final wipe-down" },
];

function Gallery() {
  return (
    <>
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="reveal text-xs uppercase tracking-[0.25em] text-primary">Gallery</p>
          <h1 className="reveal reveal-delay-1 mt-3 text-5xl sm:text-6xl font-bold max-w-3xl">
            Cars we've made <span className="text-gradient">smile.</span>
          </h1>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
            {shots.map((s, i) => (
              <figure
                key={i}
                className={`reveal-scale reveal-delay-${(i % 4) + 1} break-inside-avoid mb-5 overflow-hidden rounded-2xl border border-border bg-card group${s.tall ? " [&_img]:min-h-[22rem]" : ""}`}
              >
                <img
                  src={s.src}
                  alt={s.alt}
                  loading="lazy"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
