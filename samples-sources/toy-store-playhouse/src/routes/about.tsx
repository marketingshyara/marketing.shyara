import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SITE } from "@/lib/site-config";
import flatlay from "@/assets/about-flatlay.jpg";
import kids from "@/assets/kids-playing.jpg";
import bungalow from "@/assets/bandra-bungalow.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `Our Story — ${SITE.name}` },
      { name: "description", content: `Our story of curating tactile, joyful play for neighborhood families since 1998.` },
      { property: "og:title", content: `Our Story — ${SITE.name}` },
      { property: "og:description", content: "A quiet little shop making loud joy since 1998." },
    ],
  }),
  component: About,
});

const timeline = [
  { year: "1998", title: "A counter on the high street", body: "Began as a 200-square-foot shop with three shelves and one rule: no plastic junk." },
  { year: "2007", title: "The bigger window", body: "Moved to a brighter corner. Doubled the floor, halved the inventory. Curation over clutter." },
  { year: "2016", title: "Workshops begin", body: "Weekly storytelling and craft hours for the neighborhood's smallest readers." },
  { year: "2026", title: "Still here, still picking", body: "Three generations of local families have grown up on these shelves." },
];

const principles = [
  { n: "01", title: "Tactile First", body: "Wood, fabric, paper. We choose materials that age beautifully and feel like something." },
  { n: "02", title: "Slow Curation", body: "Every toy is held, opened and played with before it reaches our shelves." },
  { n: "03", title: "Local Always", body: "We source from Indian makers wherever the craft is finer. Always credited, always paid fairly." },
];

function About() {
  return (
    <>
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <span className="font-mono text-primary font-bold text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-5 block animate-slide-up">
            Our Story
          </span>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] max-w-5xl animate-slide-up [animation-delay:100ms]">
            A QUIET LITTLE SHOP <br />
            <span className="font-serif italic font-semibold text-accent lowercase tracking-normal">making loud joy</span> <br />
            SINCE 1998.
          </h1>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <Reveal>
            <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden bg-secondary/30">
              <img src={flatlay} alt="Assorted toys flat lay" width={1200} height={900} loading="lazy" className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-12">
          <Reveal className="md:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-4">Why we do this</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter leading-tight">
              The world doesn't need another toy store. It needed this one.
            </h2>
          </Reveal>
          <div className="md:col-span-7 md:col-start-7 space-y-6 text-lg leading-relaxed text-muted-foreground">
            <Reveal delay={100}>
              <p>
                We started on a slow Sunday with a single carton of wooden trains and a hand-painted sign. The neighborhood made the rest happen.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p>Today we still pick every piece by hand. We still know the kids by name. And the chai is still on the house.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-foreground text-background rounded-[40px] mx-3 sm:mx-6">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <Reveal>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tighter mb-12 sm:mb-16">A short history.</h2>
          </Reveal>
          <div className="space-y-10 sm:space-y-12">
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 100}>
                <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[140px_1fr] gap-6 sm:gap-12 border-t border-background/10 pt-10">
                  <div className="font-mono text-sm text-background/60">{t.year}</div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{t.title}</h3>
                    <p className="text-background/70 max-w-xl">{t.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter mb-12">House Principles</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {principles.map((p, i) => (
              <Reveal key={p.n} delay={i * 120}>
                <div className="p-8 rounded-3xl bg-muted h-full border border-foreground/5">
                  <span className="font-mono text-xs text-primary">{p.n}</span>
                  <h3 className="text-2xl font-bold mt-3 mb-3">{p.title}</h3>
                  <p className="text-muted-foreground">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Reveal>
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <img src={kids} alt="Children playing" width={1000} height={1200} loading="lazy" className="w-full h-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <img src={bungalow} alt="Toy shop exterior" width={1000} height={1200} loading="lazy" className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
