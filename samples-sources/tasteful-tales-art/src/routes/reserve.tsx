import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import diningroom from "@/assets/diningroom.jpg";
import cellar from "@/assets/cellar.jpg";

export const Route = createFileRoute("/reserve")({
  head: () => ({
    meta: [
      { title: "Reserve — L'Éclipse" },
      { name: "description", content: "A single seating each evening, Tuesday through Saturday." },
      { property: "og:title", content: "Reserve — L'Éclipse" },
      { property: "og:description", content: "Tables open six weeks in advance." },
      { property: "og:image", content: diningroom },
    ],
  }),
  component: ReservePage,
});

function ReservePage() {
  return (
    <>
      <section className="relative h-[70svh] overflow-hidden">
        <img src={diningroom} alt="The dining room" className="h-full w-full object-cover opacity-60 hero-zoom" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center hero-entrance">
          <span className="text-[10px] uppercase tracking-[0.5em] text-gold">Reservations</span>
          <h1 className="mt-6 font-serif text-5xl italic md:text-8xl">A Seat by the Fire</h1>
          <p className="mt-6 max-w-md text-bone/70">A single seating each evening, Tuesday through Saturday.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24 md:px-10 md:py-32">
        <div className="grid gap-12 md:grid-cols-3">
          {[
            { label: "Service", value: "19:00 — 23:00", note: "Tue · Wed · Thu · Fri · Sat" },
            { label: "Capacity", value: "28 seats", note: "Single seating each evening" },
            { label: "Booking Window", value: "Six weeks", note: "Released first of each month, 09:00 GMT" },
          ].map((b, i) => (
            <Reveal key={b.label} delay={i * 120}>
              <div className="border-t border-gold/40 pt-6">
                <div className="text-[10px] uppercase tracking-[0.3em] text-gold">{b.label}</div>
                <div className="mt-4 font-serif text-3xl md:text-4xl">{b.value}</div>
                <p className="mt-3 text-sm text-bone/55">{b.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img src={cellar} alt="Candlelit cellar" loading="lazy" className="h-[60svh] w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-obsidian/55 px-6 text-center">
          <Reveal>
            <h2 className="font-serif text-3xl italic md:text-5xl">To Reserve</h2>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-bone/70">
              All bookings are arranged personally with our concierge by telephone or email.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 text-[10px] uppercase tracking-[0.35em]">
              <a href="tel:+442079460122" className="text-gold transition-colors hover:text-bone">+44 20 7946 0122</a>
              <a href="mailto:concierge@leclipse.com" className="text-gold transition-colors hover:text-bone">concierge@leclipse.com</a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 md:px-10">
        <Reveal>
          <h3 className="text-center font-serif text-3xl italic md:text-4xl">House Notes</h3>
        </Reveal>
        <div className="mt-12 space-y-6 text-sm leading-relaxed text-bone/60">
          {[
            "We ask that all guests arrive within fifteen minutes of their reserved time.",
            "Dietary requirements are honoured with notice of forty-eight hours.",
            "We do not permit photography during service. The room is dim by design.",
            "Smart attire is appreciated. We have no formal dress code.",
          ].map((line, i) => (
            <Reveal key={i} delay={i * 80}>
              <p className="border-l border-gold/40 pl-6">{line}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
