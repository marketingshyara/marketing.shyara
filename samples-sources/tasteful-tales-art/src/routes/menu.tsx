import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import oysters from "@/assets/oysters.jpg";
import dishScallop from "@/assets/dish-scallop.jpg";
import dishRoots from "@/assets/dish-roots.jpg";
import beef from "@/assets/beef.jpg";
import dishCacao from "@/assets/dish-cacao.jpg";
import herbs from "@/assets/herbs.jpg";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "The Kitchen — L'Éclipse" },
      { name: "description", content: "Seasonal tasting courses guided by what the land offers each week." },
      { property: "og:title", content: "The Kitchen — L'Éclipse" },
      { property: "og:description", content: "Eight movements. Three hours. One night, every night." },
      { property: "og:image", content: dishScallop },
    ],
  }),
  component: MenuPage,
});

const courses = [
  {
    chapter: "I. Prelude",
    img: oysters,
    items: [
      { name: "Oysters & Sea Foam", note: "Cucumber granita · finger lime · sea herbs", price: "18" },
      { name: "Smoked Almond Brioche", note: "Cultured butter · activated charcoal", price: "12" },
    ],
  },
  {
    chapter: "II. From the Coast",
    img: dishScallop,
    items: [
      { name: "Charred Scallop", note: "Kombu butter · emerald oil · sorrel", price: "32" },
      { name: "Cured Mackerel", note: "Buttermilk · pickled elderflower · dill", price: "26" },
    ],
  },
  {
    chapter: "III. From the Soil",
    img: dishRoots,
    items: [
      { name: "Winter Earth", note: "Heirloom roots · truffle soil · brown butter", price: "28" },
      { name: "Smoked Beetroot Tartare", note: "Whipped goat curd · pine oil · rye crumb", price: "24" },
    ],
  },
  {
    chapter: "IV. The Flame",
    img: beef,
    items: [
      { name: "Aged Dexter Sirloin", note: "Marrow jus · charred onion ash · watercress", price: "58" },
      { name: "Game Bird & Plum", note: "Spiced reduction · roasted shallot · juniper", price: "46" },
    ],
  },
  {
    chapter: "V. The Garden",
    img: herbs,
    items: [
      { name: "Forager's Plate", note: "Seven leaves · cold-pressed seed oils · seeds", price: "22" },
    ],
  },
  {
    chapter: "VI. Coda",
    img: dishCacao,
    items: [
      { name: "Nocturne Cacao", note: "70% dark · smoked salt · olive oil snow", price: "24" },
      { name: "Pear & Bay", note: "Caramelised pear · bay leaf ice cream · honey", price: "20" },
    ],
  },
];

function MenuPage() {
  return (
    <>
      <section className="px-6 pb-20 pt-40 md:px-10 md:pb-32 md:pt-48">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold">Menu — Winter 2026</span>
            <h1 className="mt-6 font-serif text-5xl italic leading-none md:text-7xl">The Kitchen</h1>
            <p className="mx-auto mt-8 max-w-xl text-bone/60 leading-relaxed">
              Eight movements. Three hours. Composed daily around what the land surrenders.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-32 md:px-10">
        <div className="mx-auto max-w-6xl space-y-24 md:space-y-32">
          {courses.map((c, idx) => (
            <Reveal key={c.chapter}>
              <div
                className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${
                  idx % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="overflow-hidden">
                  <img
                    src={c.img}
                    alt={c.chapter}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-gold">{c.chapter}</span>
                  <div className="mt-8 divide-y divide-bone/10">
                    {c.items.map((it) => (
                      <div key={it.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-6 py-6">
                        <div className="min-w-0">
                          <h3 className="font-serif text-2xl md:text-3xl">{it.name}</h3>
                          <p className="mt-2 text-xs uppercase tracking-wider text-bone/40">{it.note}</p>
                        </div>
                        <span className="shrink-0 font-serif text-lg text-gold">${it.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-bone/5 bg-ash px-6 py-24 text-center md:px-10">
        <Reveal>
          <p className="font-serif text-2xl italic md:text-4xl">Chef's Tasting</p>
          <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-gold">8 Courses · £165 per guest</p>
          <p className="mx-auto mt-6 max-w-md text-sm text-bone/50">Optional wine pairing curated nightly by our sommelier — £95.</p>
        </Reveal>
      </section>
    </>
  );
}
