import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHero } from "@/components/site/Section";
import about from "@/assets/about.jpg";
import g6 from "@/assets/gallery-6.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Ironside & Co." },
      { name: "description", content: "How we started, what we believe, and why the room is quiet." },
      { property: "og:title", content: "About — Ironside & Co." },
      { property: "og:description", content: "How we started, what we believe, and why the room is quiet." },
    ],
  }),
  component: About,
});

const timeline = [
  { y: "2012", t: "Two chairs on Holloway Lane.", d: "Marco opens with one barber, a Belmont mirror and a kettle." },
  { y: "2015", t: "The hot towel returns.", d: "We add the straight razor menu. Forty-minute shaves become the house signature." },
  { y: "2019", t: "Six chairs, one rule.", d: "We expand next door but keep the same rule: one client, one barber, no rush." },
  { y: "2024", t: "Apprenticeship begins.", d: "We open a two-year program for the next generation of New York barbers." },
];

function About() {
  return (
    <Page>
      <PageHero
        eyebrow="Our Story"
        title="A quiet room, a sharp blade, and time on your side."
        subtitle="Ironside is small on purpose. We'd rather know your name than your number."
        image={about}
      />

      <section className="mx-auto max-w-5xl px-6 lg:px-10 py-24 lg:py-32">
        <div className="reveal max-w-3xl">
          <span className="eyebrow">The idea</span>
          <p className="mt-6 font-display text-3xl sm:text-4xl leading-snug text-balance">
            "A barbershop should feel like a good bar. Low light, low noise, and someone behind the counter who actually wants you there."
          </p>
          <div className="mt-6 text-xs uppercase tracking-[0.24em] text-muted-foreground">— Marco Vance, founder</div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 lg:px-10 pb-24 lg:pb-32">
        <span className="eyebrow reveal">Timeline</span>
        <h2 className="reveal reveal-delay-1 mt-5 font-display text-4xl sm:text-5xl">Twelve years, four chapters.</h2>
        <ol className="mt-16 relative border-l border-border pl-8 sm:pl-12 space-y-14">
          {timeline.map((e, i) => (
            <li key={e.y} className={`reveal reveal-delay-${(i % 4) + 1} relative`}>
              <span className="absolute -left-[37px] sm:-left-[49px] top-2 h-3 w-3 bg-primary rounded-full ring-4 ring-background" />
              <div className="font-display text-primary text-2xl">{e.y}</div>
              <div className="mt-2 font-display text-2xl sm:text-3xl">{e.t}</div>
              <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">{e.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="reveal relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={g6} alt="The shop" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-background/60" />
        <div className="relative z-10 mx-auto max-w-3xl h-full px-6 flex flex-col items-center justify-center text-center">
          <span className="eyebrow">Drop by</span>
          <h3 className="mt-5 font-display text-4xl sm:text-5xl text-balance">The kettle's on. The door's open.</h3>
          <Link to="/contact" className="btn-primary mt-8">Visit us</Link>
        </div>
      </section>
    </Page>
  );
}
