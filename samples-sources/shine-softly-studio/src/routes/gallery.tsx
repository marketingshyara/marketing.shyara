import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";
import g5 from "@/assets/g5.jpg";
import g6 from "@/assets/g6.jpg";
import g7 from "@/assets/g7.jpg";
import mens from "@/assets/mens.jpg";
import cut from "@/assets/cut.jpg";
import color from "@/assets/color.jpg";
import styling from "@/assets/styling.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Maison Hair Atelier" },
      { name: "description", content: "A small archive of recent work from the chairs at Maison." },
      { property: "og:title", content: "Gallery — Maison" },
      { property: "og:description", content: "A visual archive of recent work." },
    ],
  }),
  component: Gallery,
});

const items = [
  { img: g1, label: "Glass Black", tag: "Cut · Treatment" },
  { img: g7, label: "Textured Crop", tag: "Grooming · Skin Fade" },
  { img: g5, label: "Honey Lights", tag: "Balayage" },
  { img: g3, label: "Natural Texture", tag: "Cut · Care" },
  { img: mens, label: "Classic Scissor", tag: "Grooming" },
  { img: cut, label: "The Trim", tag: "Precision Cut" },
  { img: g2, label: "Sharp Bob", tag: "Cut · Color" },
  { img: color, label: "Auburn Gloss", tag: "Single Process" },
  { img: g6, label: "Pixie", tag: "Restyle" },
  { img: styling, label: "Soft Bridal", tag: "Occasion" },
  { img: g4, label: "Studio Ritual", tag: "Treatment" },
];

function Gallery() {
  return (
    <Layout>
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <p className="reveal text-xs uppercase tracking-[0.3em] text-accent mb-6">Gallery</p>
            <h1 className="reveal reveal-delay-1 text-5xl sm:text-7xl leading-[1.05] text-balance">
              Recent work from the chairs.
            </h1>
          </div>
          <div className="md:col-span-4">
            <p className="reveal reveal-delay-2 text-foreground/70 leading-relaxed">
              A small archive — never a portfolio. The best of our work walks out the door and rarely looks back at a camera.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {items.map((it, i) => (
              <figure
                key={i}
                className={`reveal reveal-delay-${(i % 4) + 1} img-zoom group relative ${
                  i % 5 === 0 ? "row-span-2" : ""
                }`}
              >
                <img
                  src={it.img}
                  alt={it.label}
                  className={`w-full object-cover ${
                    i % 5 === 0 ? "aspect-[3/5]" : "aspect-[4/5]"
                  }`}
                  loading="lazy"
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-primary/80 to-transparent text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <p className="font-display text-lg">{it.label}</p>
                  <p className="text-xs tracking-widest text-primary-foreground/70 mt-1">{it.tag}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
