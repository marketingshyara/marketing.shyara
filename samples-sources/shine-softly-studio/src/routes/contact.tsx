import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { Phone, Mail, MapPin, Clock, Instagram } from "lucide-react";
import interior from "@/assets/interior.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Visit & Book — Maison Hair Atelier" },
      { name: "description", content: "Reach Maison by phone, email or in person. Brooklyn, NY." },
      { property: "og:title", content: "Visit Maison" },
      { property: "og:description", content: "Find us, call us, write to us." },
    ],
  }),
  component: Contact,
});

const blocks = [
  { icon: MapPin, title: "Visit", lines: ["14 Linden Lane", "Brooklyn, NY 11201"] },
  { icon: Clock, title: "Hours", lines: ["Tue – Fri · 10 – 19", "Saturday · 9 – 18", "Sun / Mon · closed"] },
  { icon: Phone, title: "Call", lines: ["+1 (347) 555 0142", "By appointment"] },
  { icon: Mail, title: "Write", lines: ["hello@maisonhair.co", "Reply within 24 h"] },
];

function Contact() {
  return (
    <Layout>
      <section className="pt-36 pb-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7">
            <p className="reveal text-xs uppercase tracking-[0.3em] text-accent mb-6">Visit</p>
            <h1 className="reveal reveal-delay-1 text-5xl sm:text-7xl leading-[1.05] text-balance">
              Come by, or send a note.
            </h1>
          </div>
          <div className="md:col-span-5">
            <p className="reveal reveal-delay-2 text-foreground/70 leading-relaxed">
              The fastest way to reserve a chair is by phone — we'll match you to the right stylist and walk you through your first consultation.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {blocks.map((b, i) => (
            <div key={b.title} className={`reveal reveal-delay-${i + 1}`}>
              <b.icon size={20} className="text-accent mb-5" />
              <h2 className="text-xl mb-3">{b.title}</h2>
              {b.lines.map((l) => (
                <p key={l} className="text-sm text-foreground/70 leading-relaxed">{l}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="reveal img-zoom">
        <img src={interior} alt="Maison interior" className="w-full h-[55vh] sm:h-[75vh] object-cover" loading="lazy" />
      </section>

      <section className="py-24 sm:py-32 bg-secondary/40">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <p className="reveal text-xs uppercase tracking-[0.3em] text-accent mb-6">Direct line</p>
          <a
            href="tel:+13475550142"
            className="reveal reveal-delay-1 block font-display text-4xl sm:text-6xl link-underline"
          >
            +1 (347) 555 0142
          </a>
          <p className="reveal reveal-delay-2 mt-6 text-foreground/65">
            Or write to{" "}
            <a href="mailto:hello@maisonhair.co" className="text-accent link-underline">hello@maisonhair.co</a>
          </p>
          <a
            href="#"
            className="reveal reveal-delay-3 mt-10 inline-flex items-center gap-2 text-sm tracking-wide text-foreground/70 hover:text-accent transition"
          >
            <Instagram size={16} />
            <span className="link-underline">@maison.hair</span>
          </a>
        </div>
      </section>
    </Layout>
  );
}
