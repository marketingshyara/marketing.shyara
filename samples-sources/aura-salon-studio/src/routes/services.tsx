import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "../components/Reveal";
import serviceCut from "../assets/service-cut.jpg";
import serviceColor from "../assets/service-color.jpg";
import serviceScalp from "../assets/service-scalp.jpg";
import serviceSkin from "../assets/service-skin.jpg";
import serviceNails from "../assets/service-nails.jpg";
import serviceGrooming from "../assets/service-grooming.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — L'Artiste" },
      { name: "description", content: "A curated menu of hair, colour, skin, nails and grooming treatments." },
      { property: "og:title", content: "Services — L'Artiste" },
      { property: "og:description", content: "Selected treatments from a unisex collective." },
    ],
  }),
  component: ServicesPage,
});

const groups = [
  {
    label: "Hair",
    img: serviceCut,
    items: [
      { name: "Signature Sculpt", meta: "60 Min", price: "€85" },
      { name: "Precision Trim", meta: "30 Min", price: "€45" },
      { name: "Texture Craft", meta: "90 Min", price: "€120" },
    ],
  },
  {
    label: "Colour",
    img: serviceColor,
    items: [
      { name: "Botanic Colour", meta: "120 Min", price: "€140" },
      { name: "Tonal Refresh", meta: "75 Min", price: "€95" },
      { name: "Highlight Study", meta: "180 Min", price: "€220" },
    ],
  },
  {
    label: "Scalp",
    img: serviceScalp,
    items: [
      { name: "Ritual Wash", meta: "45 Min", price: "€60" },
      { name: "Mineral Therapy", meta: "60 Min", price: "€90" },
      { name: "Density Protocol", meta: "75 Min", price: "€110" },
    ],
  },
  {
    label: "Skin",
    img: serviceSkin,
    items: [
      { name: "Quiet Glow Facial", meta: "60 Min", price: "€95" },
      { name: "Botanic Renewal", meta: "75 Min", price: "€125" },
      { name: "Bespoke Consultation", meta: "30 Min", price: "€40" },
    ],
  },
  {
    label: "Hands",
    img: serviceNails,
    items: [
      { name: "Natural Manicure", meta: "45 Min", price: "€45" },
      { name: "Tonal Lacquer", meta: "60 Min", price: "€60" },
      { name: "Restorative Pedicure", meta: "75 Min", price: "€70" },
    ],
  },
  {
    label: "Grooming",
    img: serviceGrooming,
    items: [
      { name: "Beard Architecture", meta: "30 Min", price: "€35" },
      { name: "Hot Towel Shave", meta: "45 Min", price: "€55" },
      { name: "Brow & Lash", meta: "30 Min", price: "€30" },
    ],
  },
];

function ServicesPage() {
  return (
    <div className="bg-bone text-sage">
      <Reveal as="section" className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] text-ochre mb-8 block">The Menu</span>
          <h1 className="text-5xl sm:text-7xl md:text-[7rem] font-serif italic leading-[0.9] text-balance max-w-4xl">
            Treatments,<br />without theatre.
          </h1>
        </div>
      </Reveal>

      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-24 md:gap-32">
          {groups.map((g, i) => (
            <Reveal key={g.label} className="grid md:grid-cols-[1fr_1fr] gap-10 md:gap-20 items-center">
              <div className={`order-1 ${i % 2 === 1 ? "md:order-2" : ""}`}>
                <img
                  src={g.img}
                  alt={g.label}
                  loading="lazy"
                  width={768}
                  height={1024}
                  className="w-full aspect-[4/5] object-cover outline outline-1 -outline-offset-1 outline-black/5"
                />
              </div>
              <div className={`order-2 ${i % 2 === 1 ? "md:order-1" : ""}`}>
                <span className="text-[10px] uppercase tracking-[0.4em] text-ochre mb-4 block">
                  0{i + 1} / {g.label}
                </span>
                <h2 className="text-4xl md:text-5xl font-serif mb-10 leading-tight">{g.label}</h2>
                <ul className="divide-y divide-sage/10">
                  {g.items.map((it) => (
                    <li key={it.name} className="py-5 flex items-baseline gap-4">
                      <span className="font-serif text-lg md:text-xl flex-1 min-w-0">{it.name}</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-sage/50 hidden sm:inline">{it.meta}</span>
                      <span className="font-serif italic text-lg md:text-xl shrink-0">{it.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal as="section" className="py-32 px-6 bg-sand/30">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-3xl md:text-5xl font-serif italic mb-8 leading-tight text-balance">
            Unsure where to begin?
          </h3>
          <p className="text-sage/70 mb-10 font-light">A 30-minute consultation with no obligation. We listen first.</p>
          <Link to="/contact" className="inline-block px-8 py-4 border border-sage hover:bg-sage hover:text-bone transition-colors text-[10px] uppercase tracking-[0.3em]">
            Request a Consultation
          </Link>
        </div>
      </Reveal>
    </div>
  );
}