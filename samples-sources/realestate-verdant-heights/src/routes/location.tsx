import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { IMG } from "@/lib/images";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/location")({
  head: () => ({
    meta: [
      { title: "Location — Verdant Heights" },
      { name: "description", content: "Set in Whitefield, Bengaluru — minutes from tech parks, schools and the metro." },
      { property: "og:image", content: IMG.location },
    ],
  }),
  component: Location,
});

const nearby = [
  { tag: "Work", items: [["ITPL Tech Park", "6 min"], ["EPIP Zone", "8 min"], ["RMZ Ecoworld", "12 min"]] },
  { tag: "Schools", items: [["Inventure Academy", "9 min"], ["Greenwood High", "11 min"], ["Ryan International", "14 min"]] },
  { tag: "Care", items: [["Manipal Hospital", "10 min"], ["Sakra World", "15 min"], ["Columbia Asia", "18 min"]] },
  { tag: "Lifestyle", items: [["Phoenix Marketcity", "12 min"], ["VR Bengaluru", "9 min"], ["Forum Shantiniketan", "8 min"]] },
];

function Location() {
  return (
    <SiteLayout>
      {/* Map hero */}
      <section className="relative h-[60svh] min-h-[420px] w-full overflow-hidden">
        <img src={IMG.location} alt="Aerial view of the neighbourhood" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 h-full mx-auto max-w-7xl px-5 md:px-10 flex flex-col justify-end pb-14 md:pb-20">
          <p className="reveal text-[11px] tracking-[0.4em] uppercase text-white/80">Location</p>
          <h1 className="reveal reveal-delay-1 mt-4 font-serif text-5xl md:text-7xl text-white leading-[1] max-w-3xl text-balance">
            In the <em className="text-gold not-italic">green pocket</em> of Whitefield.
          </h1>
        </div>
      </section>

      {/* Address + summary */}
      <section className="mx-auto max-w-7xl px-5 md:px-10 py-20 md:py-28 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5 reveal">
          <div className="inline-flex items-center gap-2 text-gold">
            <MapPin size={18} />
            <span className="text-[10px] tracking-[0.3em] uppercase">Site Address</span>
          </div>
          <p className="mt-5 font-serif text-3xl md:text-4xl leading-tight">
            Sector 27, Greenway Avenue,<br />
            Whitefield, Bengaluru — 560066
          </p>
        </div>
        <div className="md:col-span-7 reveal reveal-delay-1 text-muted-foreground leading-relaxed text-base md:text-lg">
          Verdant Heights sits on a rare 14-acre parcel bordering the Hoodi
          lake greenbelt. The site is set back from the main road, with three
          tree-lined approaches and dedicated cycling access to the metro.
        </div>
      </section>

      {/* Nearby */}
      <section className="bg-secondary/40 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <h2 className="reveal font-serif text-3xl md:text-5xl text-balance">
            Everything you need, <em className="text-gold not-italic">close.</em>
          </h2>
          <div className="mt-12 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4 rounded-sm overflow-hidden">
            {nearby.map((n, i) => (
              <div key={n.tag} className={`reveal reveal-delay-${i + 1} bg-background p-7 md:p-9`}>
                <p className="text-[10px] tracking-[0.3em] uppercase text-accent">{n.tag}</p>
                <ul className="mt-5 space-y-3.5 text-sm">
                  {n.items.map(([name, time]) => (
                    <li key={name} className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-3 last:border-0">
                      <span>{name}</span>
                      <span className="text-muted-foreground tracking-wider text-xs">{time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map embed */}
      <section className="mx-auto max-w-7xl px-5 md:px-10 py-20 md:py-28">
        <div className="reveal overflow-hidden rounded-sm border border-border aspect-[16/9]">
          <iframe
            title="Verdant Heights on map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=77.7300%2C12.9650%2C77.7700%2C12.9950&layer=mapnik&marker=12.98%2C77.75"
            className="h-full w-full"
            loading="lazy"
          />
        </div>
      </section>
    </SiteLayout>
  );
}
