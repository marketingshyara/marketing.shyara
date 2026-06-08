import { createFileRoute } from "@tanstack/react-router";
import { useReveal } from "@/hooks/use-reveal";
import studio from "@/assets/studio.jpg";
import community from "@/assets/community.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Ānanda Yoga" },
      { name: "description", content: "The story, the space, and the small community behind Ānanda." },
      { property: "og:title", content: "About — Ānanda Yoga" },
      { property: "og:description", content: "The story, the space, and the small community behind Ānanda." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref}>
      <section className="pt-40 pb-16 md:pt-48 md:pb-24">
        <div className="container-x max-w-3xl">
          <span data-reveal className="text-xs uppercase tracking-[0.3em] text-accent">About</span>
          <h1 data-reveal className="mt-6 text-5xl md:text-7xl leading-[1.05]">A small studio with steady roots.</h1>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-x overflow-hidden rounded-2xl" data-reveal>
          <img src={studio} alt="Studio interior" loading="lazy" className="w-full aspect-[16/9] object-cover" width={1400} height={900} />
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="container-x grid md:grid-cols-12 gap-10 md:gap-16">
          <div data-reveal className="md:col-span-5">
            <h2 className="text-3xl md:text-4xl">Our story</h2>
          </div>
          <div data-reveal className="md:col-span-7 space-y-5 text-lg text-muted-foreground leading-relaxed">
            <p>
              Ānanda opened in 2014 in a quiet corner of southeast Portland. We wanted a studio that felt
              less like a gym and more like a friend's living room — warm, unhurried, and honest.
            </p>
            <p>
              Ten years on, the philosophy hasn't moved. Small classes. Attentive teachers. A practice
              that meets you, not the other way around.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-muted/40">
        <div className="container-x grid md:grid-cols-3 gap-10">
          {[
            { k: "10", l: "Years in practice" },
            { k: "12", l: "Maximum per class" },
            { k: "7", l: "Days a week" },
          ].map((s) => (
            <div data-reveal key={s.l} className="text-center">
              <div className="font-serif text-7xl md:text-8xl text-foreground">{s.k}</div>
              <div className="mt-3 text-sm uppercase tracking-widest text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container-x grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div data-reveal>
            <h2 className="text-4xl md:text-5xl">A community, not a membership.</h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              We host seasonal gatherings, monthly tea circles, and quarterly silent practice mornings.
              Open to anyone with a mat — and to those without one.
            </p>
          </div>
          <div data-reveal className="overflow-hidden rounded-2xl">
            <img src={community} alt="Community class" loading="lazy" className="w-full aspect-[4/3] object-cover" width={1400} height={900} />
          </div>
        </div>
      </section>
    </div>
  );
}
