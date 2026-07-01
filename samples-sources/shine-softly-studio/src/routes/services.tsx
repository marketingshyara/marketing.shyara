import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import cut from "@/assets/cut.jpg";
import color from "@/assets/color.jpg";
import styling from "@/assets/styling.jpg";
import mens from "@/assets/mens.jpg";
import g4 from "@/assets/g4.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Pricing — Maison Hair Atelier" },
      { name: "description", content: "Cuts, color, grooming, treatments and occasion styling for all at Maison. Considered services with transparent pricing." },
      { property: "og:title", content: "Services — Maison" },
      { property: "og:description", content: "Cuts, color, treatments and styling." },
    ],
  }),
  component: Services,
});

const categories = [
  {
    img: cut,
    name: "Cuts & Shapes",
    intro: "Cuts for every head — long, short, curly, fine. Shaped to the way your hair grows and the way you live.",
    items: [
      { name: "Signature Cut", time: "60 min", price: "$120" },
      { name: "Short / Cropped Cut", time: "45 min", price: "$85" },
      { name: "Restyle", time: "90 min", price: "$160" },
      { name: "Fringe / Bang Trim", time: "20 min", price: "$30" },
      { name: "Children (under 12)", time: "30 min", price: "$55" },
    ],
  },
  {
    img: mens,
    name: "Grooming & Barbering",
    intro: "Skin fades, classic scissor work, beard sculpting and the kind of hot-towel shave that earns repeat visits.",
    items: [
      { name: "Skin Fade", time: "45 min", price: "$60" },
      { name: "Classic Scissor Cut", time: "45 min", price: "$55" },
      { name: "Beard Sculpt & Line-up", time: "30 min", price: "$35" },
      { name: "Hot Towel Shave", time: "45 min", price: "$50" },
      { name: "Cut + Beard Combo", time: "75 min", price: "$85" },
    ],
  },
  {
    img: color,
    name: "Color",
    intro: "Hand-painted, lived-in color built to grow out as gracefully as it goes in. Grey-blending and natural tones welcome.",
    items: [
      { name: "Single Process", time: "90 min", price: "from $140" },
      { name: "Balayage", time: "3 hr", price: "from $280" },
      { name: "Full Highlights", time: "3 hr", price: "from $260" },
      { name: "Grey Blending", time: "45 min", price: "from $70" },
      { name: "Color Correction", time: "by consult", price: "from $400" },
    ],
  },
  {
    img: g4,
    name: "Care & Treatments",
    intro: "Strengthening and softening rituals to make your hair — and scalp — feel like themselves again.",
    items: [
      { name: "Olaplex Bond Treatment", time: "30 min", price: "$55" },
      { name: "Deep Conditioning Ritual", time: "45 min", price: "$70" },
      { name: "Scalp Therapy", time: "30 min", price: "$60" },
      { name: "Keratin Smoothing", time: "2.5 hr", price: "from $320" },
    ],
  },
  {
    img: styling,
    name: "Occasion",
    intro: "Bridal, editorial and event styling, scheduled with quiet attention.",
    items: [
      { name: "Blow Dry", time: "45 min", price: "$70" },
      { name: "Updo / Event Styling", time: "60 min", price: "$110" },
      { name: "Bridal Trial", time: "90 min", price: "$160" },
      { name: "Wedding Day Service", time: "by consult", price: "from $250" },
    ],
  },
];

function Services() {
  return (
    <Layout>
      <section className="pt-36 pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="reveal text-xs uppercase tracking-[0.3em] text-accent mb-6">Services</p>
          <h1 className="reveal reveal-delay-1 text-5xl sm:text-7xl max-w-4xl leading-[1.05] text-balance">
            One menu, open to everyone.
          </h1>
          <p className="reveal reveal-delay-2 mt-8 max-w-xl text-foreground/70 leading-relaxed">
            Prices begin where they begin; final quotes are confirmed during your in-person consultation, so the number on the receipt is the one we discussed.
          </p>
        </div>
      </section>

      {categories.map((cat, idx) => (
        <section
          key={cat.name}
          className={`py-16 sm:py-24 ${idx % 2 === 1 ? "bg-secondary/40" : ""}`}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 grid md:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className={`md:col-span-5 reveal img-zoom ${idx % 2 === 1 ? "md:order-2" : ""}`}>
              <img src={cat.img} alt={cat.name} className="w-full aspect-[4/5] object-cover" loading="lazy" />
            </div>
            <div className={`md:col-span-7 ${idx % 2 === 1 ? "md:order-1 md:pr-8" : "md:pl-8"}`}>
              <p className="reveal text-xs tracking-widest text-accent mb-3">
                {String(idx + 1).padStart(2, "0")}
              </p>
              <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl mb-5">{cat.name}</h2>
              <p className="reveal reveal-delay-2 text-foreground/70 max-w-lg leading-relaxed mb-10">
                {cat.intro}
              </p>
              <ul className="divide-y divide-border">
                {cat.items.map((it, i) => (
                  <li
                    key={it.name}
                    className={`reveal reveal-delay-${Math.min(i + 1, 4)} py-5 flex items-baseline justify-between gap-4`}
                  >
                    <div className="flex-1">
                      <p className="text-base sm:text-lg">{it.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{it.time}</p>
                    </div>
                    <p className="font-display text-lg sm:text-xl whitespace-nowrap">{it.price}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

      <section className="py-24 sm:py-32 text-center">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="reveal text-xs uppercase tracking-[0.3em] text-accent mb-6">Not sure where to begin?</p>
          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl leading-tight text-balance">
            Book a 20-minute consultation. We'll plan it together.
          </h2>
        </div>
      </section>
    </Layout>
  );
}
