import { createFileRoute } from "@tanstack/react-router";
import { useReveal } from "@/hooks/use-reveal";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ānanda Yoga" },
      { name: "description", content: "Visit, call, or write to us. We're open seven days a week." },
      { property: "og:title", content: "Contact — Ānanda Yoga" },
      { property: "og:description", content: "Visit, call, or write to us. We're open seven days a week." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref}>
      <section className="pt-40 pb-16 md:pt-48 md:pb-24">
        <div className="container-x max-w-3xl">
          <span data-reveal className="text-xs uppercase tracking-[0.3em] text-accent">Visit us</span>
          <h1 data-reveal className="mt-6 text-5xl md:text-7xl leading-[1.05]">Come breathe with us.</h1>
          <p data-reveal className="mt-6 text-lg text-muted-foreground leading-relaxed">
            The kettle is always on. Stop by, say hello, and look around.
          </p>
        </div>
      </section>

      <section className="pb-32">
        <div className="container-x grid md:grid-cols-2 gap-10 md:gap-16">
          <div data-reveal className="space-y-8">
            {[
              { icon: MapPin, title: "Studio", lines: ["42 Linden Lane", "Portland, OR 97204"] },
              { icon: Clock, title: "Hours", lines: ["Mon–Fri · 6am – 9pm", "Sat–Sun · 8am – 6pm"] },
              { icon: Mail, title: "Email", lines: ["hello@ananda.studio"] },
              { icon: Phone, title: "Phone", lines: ["(503) 555-0142"] },
            ].map((b) => (
              <div key={b.title} className="flex gap-5">
                <div className="shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center text-accent">
                  <b.icon size={18} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{b.title}</div>
                  {b.lines.map((l) => (
                    <div key={l} className="text-lg text-foreground mt-1">{l}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div data-reveal className="rounded-2xl overflow-hidden border border-border min-h-[400px]">
            <iframe
              title="Map of studio location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-122.6850%2C45.5120%2C-122.6630%2C45.5240&layer=mapnik"
              className="w-full h-full min-h-[400px]"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
