import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import journal1 from "@/assets/journal-1.jpg";
import journal2 from "@/assets/journal-2.jpg";
import journal3 from "@/assets/journal-3.jpg";
import bouquetPeony from "@/assets/bouquet-peony.jpg";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — Bloom & Vine" },
      { name: "description", content: "Field notes, seasonal guides and care tips from the Bloom & Vine studio." },
      { property: "og:title", content: "Journal — Bloom & Vine" },
      { property: "og:description", content: "Field notes, seasonal guides and care tips from the Bloom & Vine studio." },
    ],
  }),
  component: Journal,
});

const posts = [
  { img: journal1, tag: "Care", date: "May 12", title: "How to dry lavender at home", excerpt: "A simple method for keeping summer on the wall through winter." },
  { img: journal2, tag: "Notes", date: "Apr 28", title: "A love letter to ranunculus", excerpt: "On the flower that started the studio, ten springs ago." },
  { img: journal3, tag: "Weddings", date: "Apr 14", title: "Anna & Theo, by the coast", excerpt: "An ivory rose arch, sea mist and the longest table we've ever set." },
  { img: bouquetPeony, tag: "Seasonal", date: "Mar 30", title: "What blooms in May", excerpt: "Peonies, lilac, sweet peas — the soft month, finally." },
];

function Journal() {
  return (
    <>
      <section className="pt-36 pb-16 md:pt-44 md:pb-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-sage">Journal</p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.05] text-balance md:text-7xl">
              Field notes from the studio.
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28 md:px-10 md:pb-40">
        <div className="grid gap-x-10 gap-y-20 md:grid-cols-2">
          {posts.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 120} className="group cursor-pointer">
              <div className="overflow-hidden rounded-lg bg-cream">
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-[5/4] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span>{p.tag}</span>
                <span className="h-px w-6 bg-border" />
                <span>{p.date}</span>
              </div>
              <h2 className="mt-3 font-serif text-2xl leading-snug md:text-3xl">
                <span className="bg-gradient-to-r from-foreground to-foreground bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                  {p.title}
                </span>
              </h2>
              <p className="mt-2 max-w-md text-muted-foreground">{p.excerpt}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
