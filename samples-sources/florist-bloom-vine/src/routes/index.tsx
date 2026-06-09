import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import hero from "@/assets/hero.jpg";
import bouquetRose from "@/assets/bouquet-rose.jpg";
import bouquetPeony from "@/assets/bouquet-peony.jpg";
import bouquetWild from "@/assets/bouquet-wild.jpg";
import studioImg from "@/assets/studio.jpg";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bloom & Vine — Seasonal Florals, Made by Hand" },
      { name: "description", content: "A small studio florist arranging seasonal stems for everyday rituals and tender milestones." },
      { property: "og:title", content: "Bloom & Vine — Seasonal Florals, Made by Hand" },
      { property: "og:description", content: "A small studio florist arranging seasonal stems for everyday rituals and tender milestones." },
      { property: "og:image", content: hero },
    ],
  }),
  component: Index,
});

const collection = [
  { img: bouquetRose, name: "Garden Rose", note: "soft blush", price: "$58" },
  { img: bouquetPeony, name: "Ivory Peony", note: "quiet white", price: "$72" },
  { img: bouquetWild, name: "Meadow Wild", note: "fields & sun", price: "$46" },
];

function Index() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden pt-24">
        <div className="absolute inset-0 -z-10">
          <img
            src={hero}
            alt="A soft bouquet of garden roses and peonies"
            className="h-full w-full object-cover"
            width={1536}
            height={1536}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 pb-20 md:px-10 md:pb-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/70">
              Studio florist · est. 2014
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[1.05] text-balance md:text-7xl lg:text-8xl">
              Seasonal stems,<br />
              <em className="font-light italic">gathered slowly.</em>
            </h1>
          </Reveal>
          <Reveal delay={260}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm tracking-wide text-primary-foreground transition-all hover:gap-3 hover:bg-primary/90"
              >
                Shop the collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/about"
                className="text-sm tracking-wide text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
              >
                Our story
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-5xl px-6 py-28 text-center md:px-10 md:py-40">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-sage">A note from the studio</p>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-8 font-serif text-3xl leading-snug text-balance md:text-5xl">
            We arrange flowers the way you'd arrange a quiet afternoon — with patience,
            a little wildness, and only what's in season.
          </p>
        </Reveal>
      </section>

      {/* COLLECTION */}
      <section className="bg-secondary/40 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex items-end justify-between gap-8">
            <Reveal>
              <h2 className="font-serif text-4xl md:text-5xl">This week's bouquets</h2>
            </Reveal>
            <Reveal delay={100}>
              <Link to="/shop" className="hidden text-sm tracking-wide text-foreground/80 hover:text-foreground md:inline">
                View all →
              </Link>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-10">
            {collection.map((item, i) => (
              <Reveal key={item.name} delay={i * 120} className="group">
                <div className="overflow-hidden rounded-lg bg-cream">
                  <img
                    src={item.img}
                    alt={item.name}
                    loading="lazy"
                    width={1024}
                    height={1280}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <div>
                    <h3 className="font-serif text-xl">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.note}</p>
                  </div>
                  <span className="font-serif text-lg">{item.price}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STUDIO STRIP */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-28 md:grid-cols-2 md:items-center md:gap-20 md:px-10 md:py-40">
        <Reveal className="overflow-hidden rounded-lg">
          <img
            src={studioImg}
            alt="The Bloom & Vine studio, lit by morning light"
            loading="lazy"
            width={1024}
            height={1280}
            className="aspect-[4/5] w-full object-cover md:aspect-[5/6]"
          />
        </Reveal>


        <div>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-sage">The studio</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">
              A small room. Slow mornings. Sharp scissors.
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
              We source from local growers, work in small batches, and never repeat
              an arrangement twice. Every bouquet is a one-of-one.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm tracking-wide text-foreground underline-offset-4 hover:underline"
            >
              More about us <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center md:px-10 md:py-32">
          <Reveal>
            <h2 className="font-serif text-4xl leading-tight md:text-6xl">
              Flowers for the people you love.
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mx-auto mt-6 max-w-xl text-primary-foreground/75">
              Same-day delivery across Portland, Tuesday through Saturday.
            </p>
          </Reveal>
          <Reveal delay={250}>
            <Link
              to="/shop"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-7 py-3.5 text-sm tracking-wide text-primary transition-all hover:gap-3"
            >
              Order a bouquet <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
