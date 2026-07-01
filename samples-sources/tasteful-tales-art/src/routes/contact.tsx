import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import exterior from "@/assets/exterior.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — L'Éclipse" },
      { name: "description", content: "Find us on Midnight Lane. Speak with our concierge." },
      { property: "og:title", content: "Contact — L'Éclipse" },
      { property: "og:description", content: "Find us on Midnight Lane." },
      { property: "og:image", content: exterior },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <section className="relative h-[60svh] overflow-hidden">
        <img src={exterior} alt="Restaurant exterior at night" className="h-full w-full object-cover opacity-70 hero-zoom" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/30 via-transparent to-obsidian" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center hero-entrance">
          <span className="text-[10px] uppercase tracking-[0.5em] text-gold">Contact</span>
          <h1 className="mt-6 font-serif text-5xl italic md:text-8xl">Find Us</h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-16 md:grid-cols-2 md:gap-24">
          <Reveal>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">The Address</span>
            <h2 className="mt-6 font-serif text-3xl leading-tight md:text-5xl">
              422 Midnight Lane<br />Industrial District<br />London, SE1 7PB
            </h2>
            <p className="mt-8 text-sm leading-relaxed text-bone/60 max-w-sm">
              Tucked beneath an unmarked archway between Tanner Street and the river. Watch for the brass lantern.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div className="space-y-10">
              <div className="border-t border-gold/40 pt-6">
                <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Concierge</div>
                <a href="tel:+442079460122" className="mt-3 block font-serif text-2xl transition-colors hover:text-gold">
                  +44 20 7946 0122
                </a>
                <a href="mailto:concierge@leclipse.com" className="mt-1 block text-sm text-bone/60 transition-colors hover:text-bone">
                  concierge@leclipse.com
                </a>
              </div>
              <div className="border-t border-gold/40 pt-6">
                <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Press</div>
                <a href="mailto:press@leclipse.com" className="mt-3 block font-serif text-2xl transition-colors hover:text-gold">
                  press@leclipse.com
                </a>
              </div>
              <div className="border-t border-gold/40 pt-6">
                <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Private Events</div>
                <a href="mailto:events@leclipse.com" className="mt-3 block font-serif text-2xl transition-colors hover:text-gold">
                  events@leclipse.com
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ash px-6 py-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <h3 className="text-center text-[10px] uppercase tracking-[0.4em] text-gold">Hours of Service</h3>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-y-6 text-center font-serif md:grid-cols-7">
            {[
              ["Monday", "Closed"],
              ["Tuesday", "18 — 23"],
              ["Wednesday", "18 — 23"],
              ["Thursday", "18 — 23"],
              ["Friday", "18 — 23"],
              ["Saturday", "18 — 23"],
              ["Sunday", "Closed"],
            ].map(([d, h], i) => (
              <Reveal key={d} delay={i * 60}>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-bone/40">{d}</div>
                  <div className="mt-2 text-xl text-bone">{h}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
