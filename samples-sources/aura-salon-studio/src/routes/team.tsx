import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "../components/Reveal";
import s1 from "../assets/stylist-1.png";
import s2 from "../assets/stylist-2.png";
import s3 from "../assets/stylist-3.png";
import s4 from "../assets/stylist-4.png";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Artists — L'Artiste" },
      { name: "description", content: "Meet the senior artisans behind L'Artiste — stylists, colourists, and skin specialists." },
      { property: "og:title", content: "Artists — L'Artiste" },
      { property: "og:description", content: "The hands behind the craft." },
    ],
  }),
  component: TeamPage,
});

const team = [
  { name: "Léa Marchand", role: "Creative Director", years: "16 yrs", spec: "Sculptural cut · editorial", img: s1 },
  { name: "Anders Vell", role: "Master Stylist", years: "12 yrs", spec: "Men's grooming · texture", img: s2 },
  { name: "Iris Halden", role: "Hairstylist", years: "9 yrs", spec: "Botanic colour · tonal craft", img: s3 },
  { name: "Noor Eliassen", role: "Senior Stylist", years: "8 yrs", spec: "Genderless cut · short hair", img: s4 },
];

function TeamPage() {
  return (
    <div className="bg-bone text-sage">
      <Reveal as="section" className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] text-ochre mb-8 block">The Collective</span>
          <h1 className="text-5xl sm:text-7xl md:text-[7rem] font-serif italic leading-[0.9] text-balance max-w-4xl">
            Hands trained<br />by patience.
          </h1>
        </div>
      </Reveal>

      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 gap-12 md:gap-x-16 md:gap-y-32">
          {team.map((t, i) => (
            <Reveal key={t.name} delay={(i % 2) * 120} className={`${i % 2 === 1 ? "sm:mt-24" : ""}`}>
              <div className="overflow-hidden mb-6 group">
                <img
                  src={t.img}
                  alt={`${t.name}, ${t.role}`}
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="w-full aspect-[4/5] object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex justify-between items-end gap-4">
                <div className="min-w-0">
                  <h3 className="text-2xl md:text-3xl font-serif italic truncate">{t.name}</h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ochre mt-2">{t.role}</p>
                  <p className="text-xs text-sage/60 mt-2">{t.spec}</p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-sage/50 shrink-0">{t.years}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}