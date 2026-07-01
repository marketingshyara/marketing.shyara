import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHero } from "@/components/site/Section";
import gallery2 from "@/assets/gallery-2.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Ironside & Co." },
      { name: "description", content: "Classic cuts, hot towel shaves, beard work and the Ironside ritual." },
      { property: "og:title", content: "Services — Ironside & Co." },
      { property: "og:description", content: "Classic cuts, hot towel shaves, beard work and the Ironside ritual." },
    ],
  }),
  component: Services,
});

const services = [
  { name: "The Signature Cut", time: "45 min", price: "$55", desc: "Consultation, shampoo, scissor-shaped cut, hot towel finish." },
  { name: "Skin Fade", time: "45 min", price: "$60", desc: "Clipper artistry from skin to your length. Precise, blended, never blunt." },
  { name: "Hot Towel Shave", time: "40 min", price: "$50", desc: "Pre-shave oil, two-pass straight razor, balm. The forty-minute ritual." },
  { name: "Beard Sculpt", time: "30 min", price: "$35", desc: "Shape, line-up and razor finish. Conditioning oil to take home." },
  { name: "The Ironside Ritual", time: "90 min", price: "$110", desc: "Cut, shave, scalp massage, espresso. Our full house experience." },
  { name: "Father & Son", time: "60 min", price: "$80", desc: "Two cuts, side by side. Quiet time, well spent." },
  { name: "Grey Blending", time: "60 min", price: "$70", desc: "Subtle ammonia-free color to soften, not hide." },
  { name: "Young Gentleman (12 & under)", time: "30 min", price: "$30", desc: "Their first real chair. We'll make it count." },
];

function Services() {
  return (
    <Page>
      <PageHero
        eyebrow="Services & Pricing"
        title="A short list, done very well."
        subtitle="Eight services. No upsells. Every chair includes a hot towel, a coffee and as much quiet as you want."
        image={gallery2}
      />

      <section className="mx-auto max-w-5xl px-6 lg:px-10 py-24 lg:py-32">
        <ul className="divide-y divide-border border-y border-border">
          {services.map((s, i) => (
            <li
              key={s.name}
              className={`reveal reveal-delay-${(i % 4) + 1} py-8 grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] gap-x-8 gap-y-3 items-baseline group`}
            >
              <div className="min-w-0">
                <h3 className="font-display text-2xl sm:text-3xl group-hover:text-primary transition-colors">{s.name}</h3>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.time}</div>
              </div>
              <p className="hidden sm:block text-sm text-muted-foreground leading-relaxed col-start-2">{s.desc}</p>
              <div className="font-display text-3xl text-primary shrink-0 justify-self-end">{s.price}</div>
              <p className="sm:hidden col-span-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </li>
          ))}
        </ul>

        <div className="reveal mt-20 text-center">
          <p className="text-sm text-muted-foreground">First visit? Add 15 minutes for a proper consultation, on the house.</p>
          <Link to="/contact" className="btn-primary mt-8 inline-flex">Reserve a chair</Link>
        </div>
      </section>
    </Page>
  );
}
