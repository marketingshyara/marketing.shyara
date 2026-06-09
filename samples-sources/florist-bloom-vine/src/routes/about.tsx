import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import about from "@/assets/about.jpg";
import shopInterior from "@/assets/shop-interior.jpg";
import journal1 from "@/assets/journal-1.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Bloom & Vine" },
      { name: "description", content: "A small Portland studio florist working with seasonal, locally grown stems." },
      { property: "og:title", content: "About — Bloom & Vine" },
      { property: "og:description", content: "A small Portland studio florist working with seasonal, locally grown stems." },
      { property: "og:image", content: about },
    ],
  }),
  component: About,
});

const values = [
  { title: "Seasonal", body: "We arrange with what's in bloom this week, never against the calendar." },
  { title: "Local", body: "Sourced from a small circle of growers within fifty miles of the studio." },
  { title: "Slow", body: "One pair of hands, a few buckets, and the time it takes to do it well." },
];

function About() {
  return (
    <>
      <section className="pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-sage">Our story</p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[1.05] text-balance md:text-7xl">
              A studio built around <em className="font-light italic">slow, seasonal</em> flowers.
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 md:grid-cols-12 md:gap-16 md:px-10 md:pb-32">
        <Reveal variant="image" className="overflow-hidden rounded-lg md:col-span-7">
          <img
            src={about}
            alt="Hands tying a bouquet in the studio"
            loading="lazy"
            width={1280}
            height={1536}
            className="aspect-[4/5] w-full object-cover"
          />
        </Reveal>

        <div className="md:col-span-5 md:pt-16">
          <Reveal>
            <p className="font-serif text-2xl leading-relaxed text-balance md:text-3xl">
              Bloom &amp; Vine began on a kitchen table in 2014, with a single bucket of
              ranunculus and a stubborn idea: that flowers should feel like the garden
              they came from.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-8 leading-relaxed text-muted-foreground">
              A decade later we work from a small storefront on Linden Lane, still small,
              still slow, still one pair of hands at a time.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary/40 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-sage">What we believe</p>
          </Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-14">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 120}>
                <span className="font-serif text-5xl text-blush">0{i + 1}</span>
                <h3 className="mt-4 font-serif text-2xl">{v.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-24 md:grid-cols-2 md:gap-6 md:px-10 md:py-32">
        <Reveal variant="image" className="overflow-hidden rounded-lg">
          <img src={shopInterior} alt="The Linden Lane storefront" loading="lazy" width={1536} height={1024} className="aspect-[4/3] w-full object-cover" />
        </Reveal>
        <Reveal variant="image" delay={150} className="overflow-hidden rounded-lg">
          <img src={journal1} alt="Dried lavender hanging in the studio" loading="lazy" width={1024} height={1024} className="aspect-[4/3] w-full object-cover" />
        </Reveal>
      </section>
    </>
  );
}
