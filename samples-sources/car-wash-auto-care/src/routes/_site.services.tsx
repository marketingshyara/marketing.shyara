import { createFileRoute } from "@tanstack/react-router";
import { Check, MessageCircle, Phone } from "lucide-react";
import wash from "@/assets/service-wash.jpg";
import detail from "@/assets/service-detail.jpg";
import ceramic from "@/assets/service-ceramic.jpg";
import repair from "@/assets/service-repair.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery5 from "@/assets/gallery-5.jpg";

export const Route = createFileRoute("/_site/services")({
  head: () => ({
    meta: [
      { title: "Services — Shyara Auto Care" },
      { name: "description", content: "Foam wash, interior detailing, ceramic coating, mechanical repair and more at Shyara Auto Care." },
      { property: "og:title", content: "Services — Shyara Auto Care" },
      { property: "og:description", content: "Wash, detail and repair packages built around your car." },
    ],
  }),
  component: Services,
});

const services = [
  { img: wash, title: "Express Foam Wash", price: "₹299", time: "30 min", points: ["Snow-foam body wash", "Wheel & tyre clean", "Hand-dry with microfiber", "Tyre dressing"] },
  { img: detail, title: "Deep Interior Detail", price: "₹1,499", time: "2 hr", points: ["Vacuum + dust blowout", "Shampoo seats & carpet", "Dashboard polish", "Odour neutralise"] },
  { img: ceramic, title: "Ceramic Coating", price: "₹8,999", time: "Full day", points: ["Paint correction", "9H ceramic layer", "3-year hydrophobic gloss", "Aftercare kit"] },
  { img: repair, title: "Periodic Service", price: "₹1,899", time: "3 hr", points: ["Engine oil + filter", "Brake & clutch check", "AC performance test", "20-point inspection"] },
  { img: gallery2, title: "Alloy & Tyre Care", price: "₹599", time: "45 min", points: ["Alloy degreasing", "Brake-dust removal", "Tyre rejuvenation", "Pressure balance"] },
  { img: gallery5, title: "Headlight Restoration", price: "₹899", time: "1 hr", points: ["Oxidation removal", "UV polish", "Brightness boost", "Clear-coat sealant"] },
];

function Services() {
  return (
    <>
      <section className="pt-36 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="reveal text-xs uppercase tracking-[0.25em] text-primary">Services</p>
          <h1 className="reveal reveal-delay-1 mt-3 text-5xl sm:text-6xl font-bold max-w-3xl">
            Care, packaged for <span className="text-gradient">every drive.</span>
          </h1>
          <p className="reveal reveal-delay-2 mt-5 text-muted-foreground max-w-xl">
            From a quick rinse to a full-day ceramic coat — pick what suits your day.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article
              key={s.title}
              className={`reveal-scale reveal-delay-${(i % 4) + 1} group rounded-2xl overflow-hidden bg-card border border-border hover-lift flex flex-col`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img src={s.img} alt={s.title} loading="lazy" className="size-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-xl font-semibold">{s.title}</h2>
                  <span className="text-xs text-muted-foreground">{s.time}</span>
                </div>
                <div className="mt-1 text-2xl font-display font-bold text-gradient">{s.price}</div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex-1">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2"><Check className="size-4 text-primary mt-0.5 shrink-0" />{p}</li>
                  ))}
                </ul>
                <a
                  href={`https://wa.me/919584661610?text=Hi%20Shyara%2C%20I%27d%20like%20to%20book%20${encodeURIComponent(s.title)}.`}
                  target="_blank" rel="noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 bg-gradient-brand text-primary-foreground px-5 py-3 rounded-full text-sm font-medium hover:shadow-glow transition-shadow"
                >
                  <MessageCircle className="size-4" /> Book on WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 reveal-scale rounded-3xl bg-surface border border-border p-10 sm:p-14 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold">Need something custom?</h3>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Tell us about your car and we'll build a package that fits.
          </p>
          <a href="tel:+919584661610" className="mt-6 inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground px-6 py-3.5 rounded-full font-medium shadow-glow">
            <Phone className="size-4" /> Speak to an expert
          </a>
        </div>
      </section>
    </>
  );
}
