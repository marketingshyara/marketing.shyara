import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import bouquetPeony from "@/assets/bouquet-peony.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Bloom & Vine" },
      { name: "description", content: "Visit the Bloom & Vine studio on Linden Lane, or get in touch about weddings and events." },
      { property: "og:title", content: "Contact — Bloom & Vine" },
      { property: "og:description", content: "Visit the Bloom & Vine studio on Linden Lane, or get in touch about weddings and events." },
    ],
  }),
  component: Contact,
});

const details = [
  { Icon: MapPin, label: "Studio", lines: ["14 Linden Lane", "Portland, OR 97209"] },
  { Icon: Clock,  label: "Hours",  lines: ["Tue – Fri · 10 – 6", "Sat · 9 – 4 · Sun – Mon, closed"] },
  { Icon: Phone,  label: "Call",   lines: ["(503) 555 – 0144"] },
  { Icon: Mail,   label: "Write",  lines: ["hello@bloomandvine.co"] },
];

function Contact() {
  return (
    <>
      <section className="pt-36 pb-16 md:pt-44 md:pb-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-sage">Say hello</p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.05] text-balance md:text-7xl">
              Come visit, or send a note.
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-6 max-w-xl text-muted-foreground">
              For weddings, events and bespoke arrangements, please reach out at least
              four weeks in advance.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-6 pb-28 md:grid-cols-12 md:px-10 md:pb-40">
        <div className="md:col-span-7">
          <div className="grid gap-10 sm:grid-cols-2">
            {details.map(({ Icon, label, lines }, i) => (
              <Reveal key={label} delay={i * 100}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
                </div>
                <div className="mt-4 space-y-1 font-serif text-xl leading-relaxed">
                  {lines.map((l) => <p key={l}>{l}</p>)}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300} className="mt-16 rounded-lg border border-border bg-secondary/40 p-8 md:p-10">
            <h3 className="font-serif text-2xl">Weddings &amp; events</h3>
            <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
              We take on a small number of weddings each season so every couple gets
              our full attention. Tell us your date, your venue, and a few flowers
              you love — we'll take it from there.
            </p>
            <a
              href="mailto:weddings@bloomandvine.co"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              weddings@bloomandvine.co
            </a>
          </Reveal>
        </div>

        <Reveal variant="image" className="overflow-hidden rounded-lg md:col-span-5">
          <img
            src={bouquetPeony}
            alt="A single peony in soft light"
            loading="lazy"
            width={1024}
            height={1280}
            className="aspect-[4/5] w-full object-cover"
          />
        </Reveal>
      </section>
    </>
  );
}
