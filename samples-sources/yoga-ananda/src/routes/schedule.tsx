import { createFileRoute } from "@tanstack/react-router";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule — Ānanda Yoga" },
      { name: "description", content: "Weekly class schedule. Drop in or reserve a spot." },
      { property: "og:title", content: "Schedule — Ānanda Yoga" },
      { property: "og:description", content: "Weekly class schedule. Drop in or reserve a spot." },
    ],
  }),
  component: SchedulePage,
});

const days = [
  {
    day: "Monday",
    items: [
      { time: "6:30", name: "Sunrise Hatha", teacher: "Maya", mins: 60 },
      { time: "12:15", name: "Midday Meditation", teacher: "Theo", mins: 30 },
      { time: "18:00", name: "Vinyasa Flow", teacher: "Iris", mins: 75 },
    ],
  },
  {
    day: "Tuesday",
    items: [
      { time: "7:00", name: "Slow Flow", teacher: "Iris", mins: 60 },
      { time: "17:30", name: "Yin & Restore", teacher: "Maya", mins: 75 },
      { time: "19:30", name: "Pranayama", teacher: "Theo", mins: 45 },
    ],
  },
  {
    day: "Wednesday",
    items: [
      { time: "6:30", name: "Sunrise Hatha", teacher: "Maya", mins: 60 },
      { time: "12:15", name: "Lunch Flow", teacher: "Iris", mins: 45 },
      { time: "18:00", name: "Vinyasa Flow", teacher: "Iris", mins: 75 },
    ],
  },
  {
    day: "Thursday",
    items: [
      { time: "7:00", name: "Slow Flow", teacher: "Maya", mins: 60 },
      { time: "17:30", name: "Yin & Restore", teacher: "Theo", mins: 75 },
    ],
  },
  {
    day: "Friday",
    items: [
      { time: "6:30", name: "Sunrise Hatha", teacher: "Maya", mins: 60 },
      { time: "17:00", name: "Wind-down Flow", teacher: "Iris", mins: 60 },
      { time: "19:00", name: "Candlelit Yin", teacher: "Theo", mins: 75 },
    ],
  },
  {
    day: "Saturday",
    items: [
      { time: "9:00", name: "Long Vinyasa", teacher: "Iris", mins: 90 },
      { time: "11:00", name: "Foundations", teacher: "Maya", mins: 60 },
    ],
  },
  {
    day: "Sunday",
    items: [
      { time: "9:30", name: "Slow Flow", teacher: "Maya", mins: 75 },
      { time: "17:00", name: "Sunday Restore", teacher: "Theo", mins: 75 },
    ],
  },
];

function SchedulePage() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref}>
      <section className="pt-40 pb-16 md:pt-48 md:pb-24">
        <div className="container-x max-w-3xl">
          <span data-reveal className="text-xs uppercase tracking-[0.3em] text-accent">Weekly schedule</span>
          <h1 data-reveal className="mt-6 text-5xl md:text-7xl leading-[1.05]">This week, at the studio.</h1>
          <p data-reveal className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Walk in fifteen minutes early. Mats, blocks, and blankets are waiting.
          </p>
        </div>
      </section>

      <section className="pb-32">
        <div className="container-x space-y-10">
          {days.map((d) => (
            <div data-reveal key={d.day} className="grid md:grid-cols-12 gap-6 md:gap-10 py-8 border-t border-border">
              <h2 className="md:col-span-3 text-3xl">{d.day}</h2>
              <ul className="md:col-span-9 divide-y divide-border">
                {d.items.map((it) => (
                  <li key={it.time + it.name} className="flex items-baseline gap-6 py-5 group">
                    <span className="font-serif text-2xl md:text-3xl text-foreground w-20 md:w-24 tabular-nums">
                      {it.time}
                    </span>
                    <div className="flex-1">
                      <div className="text-lg text-foreground group-hover:text-accent transition-colors">{it.name}</div>
                      <div className="text-sm text-muted-foreground">{it.teacher} · {it.mins} min</div>
                    </div>
                    <span className="hidden sm:inline text-xs uppercase tracking-widest text-muted-foreground">
                      Open
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
