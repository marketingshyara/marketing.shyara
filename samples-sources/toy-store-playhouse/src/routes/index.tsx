import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SITE } from "@/lib/site-config";
import heroCar from "@/assets/hero-toy-car.jpg";
import heroBlocks from "@/assets/hero-blocks.jpg";
import catSofties from "@/assets/cat-softies.jpg";
import catBlocks from "@/assets/cat-blocks.jpg";
import catRetro from "@/assets/cat-retro.jpg";
import bandraBungalow from "@/assets/bandra-bungalow.jpg";
import pBoat from "@/assets/p-boat.jpg";
import pTiles from "@/assets/p-tiles.jpg";
import pRattle from "@/assets/p-rattle.jpg";
import pSpaceship from "@/assets/p-spaceship.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.name} — Boutique Toy Store` },
      { name: "description", content: SITE.tagline },
      { property: "og:title", content: `${SITE.name} — Boutique Toy Store` },
      { property: "og:description", content: SITE.tagline },
    ],
  }),
  component: Index,
});

const categories = [
  { n: "01", title: "The Softies", img: catSofties },
  { n: "02", title: "Wooden Blocks", img: catBlocks },
  { n: "03", title: "Retro Finds", img: catRetro },
] as const;

const favorites = [
  { name: "Blue Bay Boat", meta: "₹1,199 • Age 3+", img: pBoat },
  { name: "Prism Tiles", meta: "₹2,399 • Age 4+", img: pTiles },
  { name: "Earth Rattle", meta: "₹799 • Age 0+", img: pRattle },
  { name: "Mars Runner", meta: "₹1,899 • Age 6+", img: pSpaceship },
];

function Index() {
  return (
    <>
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-20 sm:pb-28">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
          <span className="text-[38vw] sm:text-[28vw] font-black leading-none tracking-tighter">PLAY</span>
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <div className="animate-slide-up">
              <span className="font-mono text-primary font-bold text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-5 block">
                Est. 1998 • Mumbai
              </span>
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-[0.85] text-balance">
                THE FINEST <br />
                <span className="text-accent">PLAYTHINGS</span>
                <br />
                FOR LITTLES.
              </h1>
            </div>

            <div className="max-w-md mt-8 sm:mt-10 animate-slide-up [animation-delay:200ms]">
              <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed mb-10">
                A curated universe of toys, trinkets and tactile joy — a neighborhood shop built for wonder.
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                <div className="size-28 sm:size-36 rounded-3xl bg-secondary/30 border border-foreground/5 overflow-hidden animate-float">
                  <img src={heroCar} alt="Wooden toy car" width={400} height={400} className="w-full h-full object-cover" />
                </div>
                <div className="size-28 sm:size-36 rounded-3xl bg-primary/10 border border-foreground/5 overflow-hidden animate-float [animation-delay:1s]">
                  <img src={heroBlocks} alt="Colorful building blocks" width={400} height={400} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-3 justify-center animate-slide-up [animation-delay:400ms]">
              <Link
                to="/shop"
                className="px-7 py-3.5 bg-foreground text-background rounded-full font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors"
              >
                Browse the Shop
              </Link>
              <Link
                to="/visit"
                className="px-7 py-3.5 border-2 border-foreground/10 rounded-full font-bold text-sm uppercase tracking-wider hover:border-foreground transition-colors"
              >
                Find the Store
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-foreground/10 bg-background py-5">
        <div className="flex gap-12 whitespace-nowrap animate-marquee font-extrabold text-2xl sm:text-3xl uppercase tracking-tighter w-max">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-12 shrink-0">
              <span>Wooden Builders</span>
              <span className="text-primary">✺</span>
              <span>Soft Companions</span>
              <span className="text-accent">✺</span>
              <span>Retro Curiosities</span>
              <span className="text-primary">✺</span>
              <span>Little Library</span>
              <span className="text-accent">✺</span>
              <span>Handpicked Joy</span>
              <span className="text-primary">✺</span>
            </div>
          ))}
        </div>
      </div>

      <section className="py-20 sm:py-28 bg-foreground text-background rounded-[40px] mx-3 sm:mx-6 mt-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">The Toy Box.</h2>
              <p className="text-background/60 text-base sm:text-lg">Hand-picked treasures from around the globe, tested by real tiny humans.</p>
            </div>
            <Link
              to="/shop"
              className="text-secondary border-b-2 border-secondary font-bold text-base sm:text-lg pb-1 self-start md:self-auto"
            >
              Explore All Categories
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {categories.map((c, i) => (
              <Reveal key={c.title} delay={i * 120} className={i === 1 ? "md:mt-12" : ""}>
                <Link to="/shop" className="group block">
                  <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden mb-5 bg-neutral-800">
                    <img
                      src={c.img}
                      alt={c.title}
                      width={800}
                      height={1000}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="text-xl sm:text-2xl font-bold uppercase">{c.title}</h3>
                    <span className="font-mono text-xs py-1 px-2 border border-white/20 rounded shrink-0">{c.n}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Reveal className="relative">
            <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden bg-accent/10">
              <img
                src={bandraBungalow}
                alt="Cozy toy shop storefront with plants"
                width={1000}
                height={1200}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-4 sm:-right-10 bg-secondary text-foreground p-6 sm:p-8 rounded-2xl max-w-[240px] hidden sm:block shadow-xl">
              <p className="font-bold italic text-lg sm:text-xl leading-tight font-serif">
                "Every toy tells a story worth holding onto."
              </p>
            </div>
          </Reveal>
          <Reveal delay={150} className="space-y-7">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[0.9]">
              BORN FOR <span className="font-serif font-semibold italic text-primary lowercase tracking-normal">little explorers.</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              We grew up believing play should feel real — wooden blocks, soft plush, and toys that invite imagination.
            </p>
            <p className="text-base text-muted-foreground">
              {SITE.name} is a space for families to rediscover the tactile joy of physical play in a digital world.
            </p>
            <div className="pt-2">
              <Link to="/about" className="inline-flex items-center gap-3 font-bold group text-sm uppercase tracking-wider">
                <span className="size-12 rounded-full border border-foreground grid place-items-center group-hover:bg-foreground group-hover:text-background transition-all">
                  →
                </span>
                Read the Chronicles
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 sm:py-24 border-t border-foreground/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold mb-10 sm:mb-12 uppercase tracking-tighter">Shop Favorites</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {favorites.map((p, i) => (
              <Reveal key={p.name} delay={i * 100}>
                <div className="group">
                  <div className="w-full aspect-square bg-muted rounded-2xl mb-4 overflow-hidden ring-1 ring-foreground/5 group-hover:ring-2 group-hover:ring-primary transition-all">
                    <img
                      src={p.img}
                      alt={p.name}
                      width={600}
                      height={600}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <p className="font-bold text-sm sm:text-base">{p.name}</p>
                  <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-0.5">{p.meta}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
