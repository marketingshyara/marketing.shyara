import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import interior from "@/assets/interior.jpg";
import s1 from "@/assets/stylist1.jpg";
import s2 from "@/assets/stylist2.jpg";
import s3 from "@/assets/stylist3.jpg";
import s4 from "@/assets/stylist4.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Maison Hair Atelier" },
      { name: "description", content: "Inside Maison: our story, the people, and the way we work." },
      { property: "og:title", content: "About Maison" },
      { property: "og:description", content: "Inside our atelier — story, people, practice." },
    ],
  }),
  component: About,
});

const team = [
  { img: s1, name: "Clara Bouvier", role: "Founder · Senior Stylist", years: "Since 2014" },
  { img: s2, name: "Theo Marsh", role: "Master Cutter", years: "Since 2017" },
  { img: s4, name: "Mateo Rivera", role: "Head Barber", years: "Since 2018" },
  { img: s3, name: "June Okafor", role: "Color Specialist", years: "Since 2020" },
];

const values = [
  { n: "01", t: "Slow consultations", d: "Twenty quiet minutes before any service begins." },
  { n: "02", t: "Honest mirrors", d: "We won't suggest what we can't maintain together." },
  { n: "03", t: "Considered products", d: "Ammonia-free color, sulfate-free care, refillable where possible." },
  { n: "04", t: "Smaller calendar", d: "Fewer guests per day, so yours doesn't feel like an interruption." },
];

function About() {
  return (
    <Layout>
      <section className="pt-36 pb-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <p className="reveal text-xs uppercase tracking-[0.3em] text-accent mb-6">About</p>
            <h1 className="reveal reveal-delay-1 text-5xl sm:text-7xl leading-[1.05] text-balance">
              A unisex studio, built around the chair.
            </h1>
          </div>
          <div className="md:col-span-5">
            <p className="reveal reveal-delay-2 text-foreground/70 leading-relaxed">
              Maison opened in 2014 with three chairs and one rule: never rush the part that matters. A decade in, our chairs are open to everyone — stylists and barbers under one roof.
            </p>
          </div>
        </div>
      </section>

      <section className="reveal img-zoom">
        <img src={interior} alt="Inside the salon" className="w-full h-[60vh] sm:h-[80vh] object-cover" loading="lazy" />
      </section>

      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid md:grid-cols-12 gap-10 lg:gap-16">
          <div className="md:col-span-5">
            <p className="reveal text-xs uppercase tracking-[0.3em] text-accent mb-4">Our story</p>
            <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl leading-tight text-balance">
              We grew out of a frustration with feeling unseen.
            </h2>
          </div>
          <div className="md:col-span-7 space-y-5 text-foreground/75 leading-relaxed">
            <p className="reveal reveal-delay-1">
              Clara opened Maison after fifteen years in salons that ran on volume. She wanted a place where the conversation came first and the appointment slot was long enough to honour it.
            </p>
            <p className="reveal reveal-delay-2">
              We've been told we feel more like an apartment than a salon, and we take that as the highest compliment. The kettle is on. The music is quiet. The work is precise.
            </p>
            <p className="reveal reveal-delay-3">
              We work with a small list of brands we trust — Davines, Oway, Olaplex — and we'll happily tell you why a product is on our shelf, or why it isn't.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="reveal text-xs uppercase tracking-[0.3em] text-accent mb-4">How we work</p>
          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl mb-14 max-w-2xl text-balance">
            Four small commitments, kept every day.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div key={v.n} className={`reveal reveal-delay-${i + 1}`}>
                <p className="text-xs text-accent tracking-widest mb-4">{v.n}</p>
                <h3 className="text-xl mb-3">{v.t}</h3>
                <p className="text-sm text-foreground/65 leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="reveal text-xs uppercase tracking-[0.3em] text-accent mb-4">The team</p>
          <h2 className="reveal reveal-delay-1 text-4xl sm:text-5xl mb-14 max-w-2xl text-balance">
            Stylists and barbers, working side by side.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {team.map((m, i) => (
              <div key={m.name} className={`reveal reveal-delay-${i + 1}`}>
                <div className="img-zoom mb-5">
                  <img src={m.img} alt={m.name} className="w-full aspect-[4/5] object-cover" loading="lazy" />
                </div>
                <h3 className="text-2xl">{m.name}</h3>
                <p className="text-sm text-accent mt-1">{m.role}</p>
                <p className="text-xs text-muted-foreground mt-2 tracking-wide">{m.years}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
