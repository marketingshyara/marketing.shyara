import { createFileRoute } from "@tanstack/react-router";
import { Page, PageHero } from "@/components/site/Section";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Visit & Book — Ironside & Co." },
      { name: "description", content: "Find us in Brooklyn. Walk-ins welcome, appointments honored to the minute." },
      { property: "og:title", content: "Visit & Book — Ironside & Co." },
      { property: "og:description", content: "Find us in Brooklyn. Walk-ins welcome." },
    ],
  }),
  component: Contact,
});

const blocks = [
  { Icon: MapPin, label: "Where", lines: ["42 Holloway Lane", "Brooklyn, NY 11211"] },
  { Icon: Phone, label: "Call", lines: ["+1 (212) 555-0142", "Text bookings welcome"] },
  { Icon: Mail, label: "Write", lines: ["hello@ironsideandco.com", "Press: press@ironsideandco.com"] },
  { Icon: Clock, label: "Hours", lines: ["Tue – Fri · 10–20", "Sat · 9–18 · Sun–Mon closed"] },
];

function Contact() {
  return (
    <Page>
      <PageHero
        eyebrow="Visit"
        title="The chair is yours, whenever you're ready."
        subtitle="Walk-ins are welcome on a first-come basis. For a guaranteed chair, give us a call."
        image={hero}
      />

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {blocks.map((b, i) => (
            <div key={b.label} className={`reveal reveal-delay-${(i % 4) + 1} bg-background p-8 lg:p-10`}>
              <b.Icon className="h-5 w-5 text-primary" strokeWidth={1.4} />
              <div className="mt-6 text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">{b.label}</div>
              <div className="mt-3 space-y-1">
                {b.lines.map((l) => (
                  <div key={l} className="text-base text-foreground">{l}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="reveal mt-20 grid lg:grid-cols-[1.4fr_1fr] gap-12 items-start">
          <div className="aspect-[16/10] overflow-hidden border border-border">
            <iframe
              title="Map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-73.96405696868898%2C40.706193894099826%2C-73.93657684326172%2C40.72381842893648&amp;layer=mapnik"
              className="w-full h-full grayscale contrast-110"
              loading="lazy"
            />
          </div>
          <div>
            <span className="eyebrow">Before you come</span>
            <h2 className="mt-5 font-display text-4xl">A few small things.</h2>
            <ul className="mt-8 space-y-5 text-sm text-muted-foreground leading-relaxed">
              <li className="border-l border-primary pl-4">Arrive five minutes early. Espresso is on us.</li>
              <li className="border-l border-primary pl-4">Bring a reference photo only if it helps you talk about what you don't want.</li>
              <li className="border-l border-primary pl-4">We're cash and card. Tipping is welcome, never expected.</li>
              <li className="border-l border-primary pl-4">No phone calls in the chair, please. It's a quiet room.</li>
            </ul>
          </div>
        </div>
      </section>
    </Page>
  );
}
