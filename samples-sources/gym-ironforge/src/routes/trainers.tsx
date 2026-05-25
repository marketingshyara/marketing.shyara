import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { Instagram, ArrowRight } from "lucide-react";
import t1 from "@/assets/trainer-1.jpg";
import t2 from "@/assets/trainer-2.jpg";
import t3 from "@/assets/trainer-3.jpg";
import t4 from "@/assets/trainer-4.jpg";

export const Route = createFileRoute("/trainers")({
  head: () => ({
    meta: [
      { title: "Trainers — IronForge Gym" },
      { name: "description", content: "Meet the IronForge coaching team." },
      { property: "og:title", content: "IronForge Trainers" },
      { property: "og:description", content: "Certified, experienced coaches who care about your results." },
    ],
  }),
  component: Trainers,
});

const TRAINERS = [
  { name: "Marcus Vale", role: "Head Strength Coach", img: t1, bio: "10+ years coaching powerlifting and Olympic lifts." },
  { name: "Lena Cruz", role: "HIIT & Conditioning", img: t2, bio: "Former pro track athlete. Programming specialist." },
  { name: "Diego Reyes", role: "Boxing Coach", img: t3, bio: "Ex-amateur national champion. Coaches all levels." },
  { name: "Anna Petrov", role: "Functional Coach", img: t4, bio: "Movement specialist. Mobility & longevity focus." },
];

function Trainers() {
  return (
    <>
      <section className="pt-32 md:pt-40 pb-12 container-x">
        <Reveal>
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">— The Team</p>
          <h1 className="text-display text-5xl md:text-8xl max-w-4xl leading-[0.9]">
            Coaches who <span className="text-primary">care.</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-xl">
            Every IronForge coach is certified, experienced, and obsessed with the craft.
          </p>
        </Reveal>
      </section>

      <section className="container-x pb-20 md:pb-28">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRAINERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06}>
              <article className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-card">
                  <img src={t.img} alt={t.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t.name} on Instagram`}
                    className="absolute top-3 right-3 size-9 grid place-items-center bg-background/70 backdrop-blur opacity-100 md:opacity-0 md:group-hover:opacity-100 transition hover:text-primary focus-ring rounded-sm"
                  >
                    <Instagram className="size-4" />
                  </a>
                </div>
                <div className="pt-5">
                  <h3 className="text-display text-xl">{t.name}</h3>
                  <p className="text-xs tracking-widest uppercase text-primary mt-1">{t.role}</p>
                  <p className="text-sm text-muted-foreground mt-3">{t.bio}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-card py-20 md:py-28">
        <div className="container-x text-center">
          <Reveal>
            <h2 className="text-display text-4xl md:text-6xl">Want to coach with us?</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">We're always looking for sharp, dedicated coaches to join the team.</p>
            <Link to="/contact" className="btn-primary mt-8 focus-ring">
              Get in Touch <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
