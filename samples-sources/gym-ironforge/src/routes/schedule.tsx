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

const SCHEDULE: Record<(typeof DAYS)[number], { time: string; name: string; coach: string; level: string }[]> = {
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
  const [day, setDay] = useState<(typeof DAYS)[number]>("Mon");
  const [reserveMsg, setReserveMsg] = useState<string | null>(null);
  const classes = SCHEDULE[day];

  const handleReserve = (className: string, time: string) => {
    setReserveMsg(`Reserved ${className} at ${time} (demo)`);
    window.setTimeout(() => setReserveMsg(null), 3000);
  };

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
          <div
            role="tablist"
            aria-label="Select day"
            className="flex flex-wrap gap-2 border-b border-border pb-4 mb-8"
          >
            {DAYS.map((d) => (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={day === d}
                aria-controls={`schedule-panel-${d}`}
                id={`schedule-tab-${d}`}
                onClick={() => setDay(d)}
                className={`text-display tracking-widest text-sm px-5 py-3 min-h-11 transition focus-ring rounded-sm ${
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

        {reserveMsg && (
          <p role="status" aria-live="polite" className="mb-4 text-sm text-primary tracking-widest uppercase">
            {reserveMsg}
          </p>
        )}

        <div
          role="tabpanel"
          id={`schedule-panel-${day}`}
          aria-labelledby={`schedule-tab-${day}`}
          className="divide-y divide-border border-y border-border"
        >
          {classes.map((c, i) => (
            <Reveal key={`${day}-${i}`} delay={i * 0.04}>
              <div className="flex flex-col gap-3 py-5 px-2 md:px-6 md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-card transition-colors">
                <div className="md:col-span-2 text-display text-2xl md:text-3xl text-primary">{c.time}</div>
                <div className="md:col-span-5">
                  <div className="text-display text-lg md:text-xl">{c.name}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">w/ {c.coach}</div>
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider md:col-span-3">{c.level}</div>
                <div className="md:col-span-2 md:text-right">
                  <button
                    type="button"
                    onClick={() => handleReserve(c.name, c.time)}
                    className="btn-ghost w-full md:w-auto focus-ring"
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
