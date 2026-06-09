import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import bouquetRose from "@/assets/bouquet-rose.jpg";
import bouquetPeony from "@/assets/bouquet-peony.jpg";
import bouquetWild from "@/assets/bouquet-wild.jpg";
import bouquetLily from "@/assets/bouquet-lily.jpg";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Bloom & Vine" },
      { name: "description", content: "Browse this season's bouquets, single stems and lasting arrangements." },
      { property: "og:title", content: "Shop — Bloom & Vine" },
      { property: "og:description", content: "Browse this season's bouquets, single stems and lasting arrangements." },
    ],
  }),
  component: Shop,
});

const products = [
  { img: bouquetRose,  name: "Garden Rose",     note: "Twelve blush garden roses, paper-wrapped.", price: "$58", tag: "Signature" },
  { img: bouquetPeony, name: "Ivory Peony",     note: "Quiet whites with eucalyptus.",            price: "$72", tag: "Limited" },
  { img: bouquetWild,  name: "Meadow Wild",     note: "Daisies, lavender, oat grass.",            price: "$46", tag: "Everyday" },
  { img: bouquetLily,  name: "Calla & Orchid",  note: "Sculptural whites in a ceramic vase.",     price: "$94", tag: "Vase" },
  { img: bouquetRose,  name: "Rose Petite",     note: "A smaller posy, made to fit a bedside.",   price: "$32", tag: "Petite" },
  { img: bouquetWild,  name: "Field Mix",       note: "What's growing this week, no two alike.",  price: "$54", tag: "Seasonal" },
];

const categories = ["All", "Signature", "Seasonal", "Vase", "Petite"];

function Shop() {
  return (
    <>
      <section className="border-b border-border/60 bg-secondary/40 pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-sage">The collection</p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.05] text-balance md:text-7xl">
              In bloom this week.
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-xl text-muted-foreground">
              A rotating selection of stems, gathered each Tuesday from local growers.
            </p>
          </Reveal>

          <Reveal delay={280}>
            <div className="mt-12 flex flex-wrap gap-2">
              {categories.map((c, i) => (
                <button
                  key={c}
                  className={`rounded-full border px-4 py-2 text-xs tracking-wide transition-colors ${
                    i === 0
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background/60 text-foreground/70 hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.name + i} delay={(i % 3) * 100} className="group">
              <div className="relative overflow-hidden rounded-lg bg-cream">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground/80 backdrop-blur">
                  {p.tag}
                </span>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-xl">{p.name}</h3>
                <span className="font-serif text-lg">{p.price}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.note}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20 text-center">
          <p className="text-sm text-muted-foreground">
            Don't see what you're looking for? Bespoke arrangements available on request.
          </p>
        </Reveal>
      </section>
    </>
  );
}
