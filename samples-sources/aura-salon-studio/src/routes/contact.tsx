import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "../components/Reveal";
import sanctuary from "../assets/sanctuary.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — L'Artiste" },
      { name: "description", content: "Find the studio, our hours, and ways to reach the L'Artiste team." },
      { property: "og:title", content: "Contact — L'Artiste" },
      { property: "og:description", content: "Visit, write, or call us." },
    ],
  }),
  component: ContactPage,
});

const hours: [string, string][] = [
  ["Monday", "Closed"],
  ["Tuesday", "10:00 — 20:00"],
  ["Wednesday", "10:00 — 20:00"],
  ["Thursday", "10:00 — 21:00"],
  ["Friday", "10:00 — 20:00"],
  ["Saturday", "09:00 — 18:00"],
  ["Sunday", "Closed"],
];

function ContactPage() {
  return (
    <div className="bg-bone text-sage">
      <Reveal as="section" className="pt-40 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] text-ochre mb-8 block">Visit</span>
          <h1 className="text-5xl sm:text-7xl md:text-[7rem] font-serif italic leading-[0.9] text-balance max-w-4xl">
            Come in, slowly.
          </h1>
        </div>
      </Reveal>

      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          <Reveal>
            <img src={sanctuary} alt="The studio entrance" loading="lazy" width={1600} height={1024} className="w-full aspect-[4/3] object-cover" />
          </Reveal>

          <Reveal delay={120} className="flex flex-col gap-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-ochre mb-3 block">The Studio</span>
              <p className="font-serif text-2xl md:text-3xl italic leading-tight">
                124 Torstraße<br />
                10119 Berlin-Mitte<br />
                Germany
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-ochre mb-3 block">Write</span>
                <a href="mailto:hello@lartiste.studio" className="font-serif text-lg italic hover:text-ochre transition-colors">
                  hello@lartiste.studio
                </a>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-ochre mb-3 block">Call</span>
                <a href="tel:+493012345678" className="font-serif text-lg italic hover:text-ochre transition-colors">
                  +49 30 1234 5678
                </a>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-ochre mb-4 block">Hours</span>
              <ul className="divide-y divide-sage/10">
                {hours.map(([d, h]) => (
                  <li key={d} className="py-3 flex justify-between text-sm">
                    <span className="font-medium">{d}</span>
                    <span className="text-sage/70">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <Reveal as="section" className="py-32 px-6 bg-sand/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-serif italic leading-tight text-balance">
            We answer by email, gently and quickly.
          </h2>
          <p className="text-sage/70 mt-8 font-light max-w-xl mx-auto">
            For bookings, consultations, or press — write to us. Our front of house will reply within one working day.
          </p>
        </div>
      </Reveal>
    </div>
  );
}