import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { MapPin, Mail, Phone, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — IronForge Gym" },
      { name: "description", content: "Visit, call, or message IronForge. Book your free trial today." },
      { property: "og:title", content: "Contact IronForge" },
      { property: "og:description", content: "Get in touch. Book a free trial." },
    ],
  }),
  component: Contact,
});

const INFO = [
  { icon: MapPin, label: "Address", value: "148 Iron Street, Downtown District" },
  { icon: Phone, label: "Phone", value: "+1 (555) 014-2200", href: "tel:+15550142200" },
  { icon: Mail, label: "Email", value: "hello@ironforge.gym", href: "mailto:hello@ironforge.gym" },
  { icon: Clock, label: "Hours", value: "Mon–Fri 5:00 – 23:00 · Sat–Sun 7:00 – 21:00" },
] as const;

function Contact() {
  return (
    <>
      <section className="pt-32 md:pt-40 pb-12 container-x">
        <Reveal>
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">— Contact</p>
          <h1 className="text-display text-5xl md:text-8xl leading-[0.9]">
            Step <span className="text-primary">inside.</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-xl">
            Drop a message, give us a call, or just walk in. Your first session is on us.
          </p>
        </Reveal>
      </section>

      <section className="container-x pb-24 grid lg:grid-cols-2 gap-10 lg:gap-16">
        <Reveal>
          <form
            onSubmit={(e) => { e.preventDefault(); alert("Thanks! We'll be in touch shortly."); }}
            className="space-y-5 p-8 md:p-10 bg-card border border-border"
          >
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground">Name</label>
              <input required type="text" className="mt-2 w-full bg-background border border-border px-4 py-3 text-foreground focus:border-primary outline-none transition" />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground">Email</label>
              <input required type="email" className="mt-2 w-full bg-background border border-border px-4 py-3 text-foreground focus:border-primary outline-none transition" />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground">Interested in</label>
              <select className="mt-2 w-full bg-background border border-border px-4 py-3 text-foreground focus:border-primary outline-none transition">
                <option>Free trial session</option>
                <option>Strength program</option>
                <option>Boxing</option>
                <option>HIIT</option>
                <option>Functional</option>
                <option>Personal training</option>
              </select>
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground">Message</label>
              <textarea rows={4} className="mt-2 w-full bg-background border border-border px-4 py-3 text-foreground focus:border-primary outline-none transition resize-none" />
            </div>
            <button type="submit" className="w-full text-display tracking-widest px-6 py-4 bg-primary text-primary-foreground shadow-ember hover:brightness-110 transition">
              Send Message
            </button>
          </form>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-6">
            {INFO.map((i) => (
              <div key={i.label} className="flex items-start gap-4 p-6 border border-border bg-card">
                <span className="size-11 shrink-0 grid place-items-center bg-primary/10 text-primary">
                  <i.icon className="size-5" />
                </span>
                <div>
                  <div className="text-xs tracking-widest uppercase text-muted-foreground">{i.label}</div>
                  <div className="mt-1 text-foreground">
                    {"href" in i && i.href ? (
                      <a href={i.href} className="hover:text-primary transition-colors">
                        {i.value}
                      </a>
                    ) : (
                      i.value
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="aspect-[5/4] bg-card border border-border overflow-hidden">
              <iframe
                title="map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-74.012,40.706,-73.992,40.722&layer=mapnik"
                className="w-full h-full grayscale contrast-125 opacity-90"
                loading="lazy"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
