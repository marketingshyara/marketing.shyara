import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { useState } from "react";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule — IronForge Gym" },
      { name: "description", content: "Weekly class schedule. Strength, HIIT, boxing and functional sessions." },
      { property: "og:title", content: "IronForge Schedule" },
      { property: "og:description", content: "Find the class that fits your week." },
    ],
  }),
  component: Schedule,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const SCHEDULE: Record<typeof DAYS[number], { time: string; name: string; coach: string; level: string }[]> = {
  Mon: [
    { time: "06:00", name: "Strength", coach: "Marcus", level: "All" },
    { time: "12:00", name: "HIIT 45", coach: "Lena", level: "All" },
    { time: "18:00", name: "Boxing", coach: "Diego", level: "Beginner" },
    { time: "19:30", name: "Functional", coach: "Anna", level: "All" },
  ],
  Tue: [
    { time: "06:30", name: "Functional", coach: "Anna", level: "All" },
    { time: "12:30", name: "Strength", coach: "Marcus", level: "Intermediate" },
    { time: "18:00", name: "HIIT 45", coach: "Lena", level: "All" },
    { time: "20:00", name: "Boxing", coach: "Diego", level: "Advanced" },
  ],
  Wed: [
    { time: "06:00", name: "HIIT 45", coach: "Lena", level: "All" },
    { time: "12:00", name: "Strength", coach: "Marcus", level: "All" },
    { time: "18:30", name: "Functional", coach: "Anna", level: "All" },
  ],
  Thu: [
    { time: "07:00", name: "Boxing", coach: "Diego", level: "All" },
    { time: "13:00", name: "Strength", coach: "Marcus", level: "Advanced" },
    { time: "18:00", name: "HIIT 45", coach: "Lena", level: "All" },
    { time: "19:30", name: "Functional", coach: "Anna", level: "Beginner" },
  ],
  Fri: [
    { time: "06:00", name: "Strength", coach: "Marcus", level: "All" },
    { time: "12:00", name: "HIIT 45", coach: "Lena", level: "All" },
    { time: "18:00", name: "Boxing", coach: "Diego", level: "All" },
  ],
  Sat: [
    { time: "09:00", name: "Strength", coach: "Marcus", level: "All" },
    { time: "10:30", name: "HIIT 60", coach: "Lena", level: "All" },
    { time: "12:00", name: "Boxing", coach: "Diego", level: "All" },
  ],
  Sun: [
    { time: "10:00", name: "Functional", coach: "Anna", level: "All" },
    { time: "11:30", name: "Open Gym", coach: "—", level: "All" },
  ],
};

function Schedule() {
  const [day, setDay] = useState<typeof DAYS[number]>("Mon");
  const classes = SCHEDULE[day];

  return (
    <>
      <section className="pt-32 md:pt-40 pb-12 container-x">
        <Reveal>
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">— Weekly Schedule</p>
          <h1 className="text-display text-5xl md:text-8xl leading-[0.9]">
            This <span className="text-primary">week.</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-xl">
            40+ coached sessions every week. Reserve your spot at the front desk or app.
          </p>
        </Reveal>
      </section>

      <section className="container-x pb-24">
        <Reveal>
          <div className="flex flex-wrap gap-2 border-b border-border pb-4 mb-8">
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={`text-display tracking-widest text-sm px-5 py-3 transition ${
                  day === d
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="divide-y divide-border border-y border-border">
          {classes.map((c, i) => (
            <Reveal key={`${day}-${i}`} delay={i * 0.04}>
              <div className="flex flex-col gap-3 py-5 px-2 md:px-6 md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-card transition">
                <div className="md:col-span-2 text-display text-2xl md:text-3xl text-primary">{c.time}</div>
                <div className="md:col-span-5">
                  <div className="text-display text-lg md:text-xl">{c.name}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">w/ {c.coach}</div>
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider md:col-span-3">{c.level}</div>
                <div className="md:col-span-2 md:text-right">
                  <button
                    type="button"
                    className="w-full md:w-auto text-display tracking-widest text-xs px-4 py-2 border border-border hover:border-primary hover:text-primary transition"
                  >
                    Reserve
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
