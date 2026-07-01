import { createFileRoute } from "@tanstack/react-router";
import { Page, PageHero } from "@/components/site/Section";
import b1 from "@/assets/barber-1.jpg";
import b2 from "@/assets/barber-2.jpg";
import b3 from "@/assets/barber-3.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

export const Route = createFileRoute("/barbers")({
  head: () => ({
    meta: [
      { title: "The Barbers — Ironside & Co." },
      { name: "description", content: "Six master barbers. One craft. Meet the team behind the chairs at Ironside & Co." },
      { property: "og:title", content: "The Barbers — Ironside & Co." },
      { property: "og:description", content: "Meet the six master barbers behind the chairs." },
    ],
  }),
  component: Barbers,
});

const team = [
  { name: "Marco Vance", role: "Founder · Master Barber", years: "18 yrs", bio: "Trained in Naples, sharpened in Brooklyn. Marco opened the doors in 2012 and still cuts every Tuesday.", img: b1 },
  { name: "Elias Hart", role: "Senior Barber · Straight Razor", years: "12 yrs", bio: "Our shave specialist. If you've never had a real hot towel, book Elias.", img: b2 },
  { name: "Sami Okonkwo", role: "Barber · Textured Cuts", years: "7 yrs", bio: "Curls, coils, fades. Sami sees the cut three steps ahead and never rushes the finish.", img: b3 },
  { name: "Joaquin Reyes", role: "Barber · Classic Tailoring", years: "9 yrs", bio: "Side parts, pomp, the gentleman's cut. Trained on Savile Row, now happily in Brooklyn.", img: b1 },
  { name: "Theo Lindgren", role: "Barber · Beard Work", years: "6 yrs", bio: "Sculptor of beards. Brings a quiet intensity and the steadiest hand in the room.", img: b2 },
  { name: "Aurélien Mas", role: "Apprentice", years: "2 yrs", bio: "Our newest hand. Trained six days a week, books fill faster than we can print cards.", img: b3 },
];

function Barbers() {
  return (
    <Page>
      <PageHero
        eyebrow="The Team"
        title="Six hands, one standard."
        subtitle="Every barber here has spent at least a thousand hours behind a chair before we hand them yours."
        image={gallery6}
      />

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-20">
          {team.map((m, i) => (
            <article key={m.name} className={`reveal reveal-delay-${(i % 3) + 1} group`}>
              <div className="overflow-hidden">
                <img
                  src={m.img}
                  alt={m.name}
                  loading="lazy"
                  className="w-full aspect-[4/5] object-cover grayscale transition-all duration-[1200ms] group-hover:grayscale-0 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                <h3 className="font-display text-2xl">{m.name}</h3>
                <span className="text-[0.7rem] uppercase tracking-[0.2em] text-primary shrink-0">{m.years}</span>
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1">{m.role}</div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
            </article>
          ))}
        </div>
      </section>
    </Page>
  );
}
