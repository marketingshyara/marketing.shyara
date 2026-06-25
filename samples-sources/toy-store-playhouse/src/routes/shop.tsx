import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/reveal";
import { SITE } from "@/lib/site-config";
import { SiteFooter } from "@/components/site-footer";
import pBoat from "@/assets/p-boat.jpg";
import pTiles from "@/assets/p-tiles.jpg";
import pRattle from "@/assets/p-rattle.jpg";
import pSpaceship from "@/assets/p-spaceship.jpg";
import pTop from "@/assets/p-top.jpg";
import pXylo from "@/assets/p-xylophone.jpg";
import pKite from "@/assets/p-kite.jpg";
import pTrain from "@/assets/p-train.jpg";
import catSofties from "@/assets/cat-softies.jpg";
import catBlocks from "@/assets/cat-blocks.jpg";
import catRetro from "@/assets/cat-retro.jpg";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: `The Shop — ${SITE.name}` },
      { name: "description", content: "Browse our boutique selection of wooden builders, plush companions, musical toys and retro curiosities." },
      { property: "og:title", content: `The Shop — ${SITE.name}` },
      { property: "og:description", content: "Boutique toys curated for curious kids and thoughtful parents." },
    ],
  }),
  component: Shop,
});

const collections = [
  { title: "The Softies", img: catSofties, count: 24 },
  { title: "Wooden Blocks", img: catBlocks, count: 18 },
  { title: "Retro Finds", img: catRetro, count: 31 },
];

const products = [
  { name: "Blue Bay Boat", meta: "₹1,199 • Age 3+", img: pBoat, tag: "New" },
  { name: "Prism Tiles", meta: "₹2,399 • Age 4+", img: pTiles, tag: null },
  { name: "Earth Rattle", meta: "₹799 • Age 0+", img: pRattle, tag: null },
  { name: "Mars Runner", meta: "₹1,899 • Age 6+", img: pSpaceship, tag: "Hot" },
  { name: "Carousel Top", meta: "₹699 • Age 4+", img: pTop, tag: null },
  { name: "Sunday Xylo", meta: "₹1,599 • Age 3+", img: pXylo, tag: null },
  { name: "Monsoon Kite", meta: "₹499 • Age 5+", img: pKite, tag: "Local" },
  { name: "Saffron Express", meta: "₹1,999 • Age 4+", img: pTrain, tag: null },
];

function Shop() {
  return (
    <>
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <span className="font-mono text-primary font-bold text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-5 block animate-slide-up">
            The Collection / 2026
          </span>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] max-w-4xl animate-slide-up [animation-delay:100ms]">
            EVERYTHING WE'D <span className="font-serif italic font-semibold text-primary lowercase tracking-normal">happily</span> WRAP UP FOR YOU.
          </h1>
        </div>
      </section>

      {/* Collections band */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {collections.map((c, i) => (
            <Reveal key={c.title} delay={i * 100}>
              <div className="group relative aspect-[5/4] rounded-3xl overflow-hidden cursor-pointer">
                <img src={c.img} alt={c.title} width={800} height={640} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-background">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70 mb-1">{c.count} pieces</p>
                  <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">{c.title}</h3>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Product grid */}
      <section className="py-16 sm:py-24 border-t border-foreground/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <Reveal className="flex items-end justify-between flex-wrap gap-4 mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter">All Playthings</h2>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{products.length} of 73 shown</p>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p, i) => (
              <Reveal key={p.name} delay={(i % 4) * 100}>
                <div className="group">
                  <div className="relative w-full aspect-square bg-muted rounded-2xl mb-4 overflow-hidden ring-1 ring-foreground/5 group-hover:ring-2 group-hover:ring-primary transition-all">
                    <img src={p.img} alt={p.name} width={600} height={600} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {p.tag && (
                      <span className="absolute top-3 left-3 bg-background px-2 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-foreground/10 rounded-full">
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-sm sm:text-base">{p.name}</p>
                  <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-0.5">{p.meta}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">Everything available in store. Come pick yours up.</p>
            <span className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/40">More on the shelves than online</span>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}