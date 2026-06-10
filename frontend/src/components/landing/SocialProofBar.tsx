import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { BrushStroke } from "@/components/landing/BrushStroke";

/** Extra viewport scroll while the proof panel stays pinned (paint + brief hold). */
const PIN_SCROLL_DVH = 200;

const stats = [
  {
    value: "50+",
    label: "Scaling brands trust us",
    direction: "ltr" as const,
    range: [0.05, 0.24] as const,
  },
  {
    value: "100+",
    label: "Projects delivered",
    direction: "rtl" as const,
    range: [0.2, 0.39] as const,
  },
  {
    value: "5+",
    label: "Years building digital solutions",
    direction: "ltr" as const,
    range: [0.35, 0.54] as const,
  },
];

function usePaintClip(
  scrollYProgress: MotionValue<number>,
  direction: "ltr" | "rtl",
  range: readonly [number, number],
  reduceMotion: boolean
) {
  const progress = useTransform(scrollYProgress, range, [0, 1], { clamp: true });

  return useTransform(progress, (p) => {
    if (reduceMotion) return "inset(0 0% 0 0)";
    const hidden = Math.round((1 - p) * 1000) / 10;
    return direction === "ltr"
      ? `inset(0 ${hidden}% 0 0)`
      : `inset(0 0 0 ${hidden}%)`;
  });
}

function StatRow({
  value,
  label,
  direction,
  range,
  scrollYProgress,
  reduceMotion,
  testId,
}: {
  value: string;
  label: string;
  direction: "ltr" | "rtl";
  range: readonly [number, number];
  scrollYProgress: MotionValue<number>;
  reduceMotion: boolean;
  testId: string;
}) {
  const clipPath = usePaintClip(scrollYProgress, direction, range, reduceMotion);

  return (
    <li data-testid={testId} className="flex list-none justify-center">
      <motion.div className="relative overflow-hidden" style={{ clipPath }}>
        <div className="relative inline-flex items-center justify-center gap-3 px-2 py-3 sm:gap-5 sm:px-3 sm:py-3.5">
          <BrushStroke className="pointer-events-none absolute -left-3.5 -right-3.5 top-1/2 h-[2.85rem] w-[calc(100%+1.75rem)] -translate-y-1/2 sm:h-[3.25rem] sm:w-[calc(100%+2rem)]" />

          <span className="relative z-[1] whitespace-nowrap font-heading text-[2.5rem] font-black leading-none tracking-tighter text-white sm:text-[3rem]">
            {value}
          </span>
          <span className="relative z-[1] text-[0.78rem] font-bold uppercase leading-none tracking-[0.11em] text-white sm:text-[0.92rem] sm:tracking-[0.13em]">
            {label}
          </span>
        </div>
      </motion.div>
    </li>
  );
}

export const SocialProofBar = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div
      ref={containerRef}
      data-testid="social-proof-scroll-track"
      className="relative w-full"
      style={
        reduceMotion
          ? undefined
          : { height: `calc(100dvh + ${PIN_SCROLL_DVH}dvh)` }
      }
    >
      <section
        data-testid="social-proof-bar"
        className="sticky top-0 z-10 flex h-[100dvh] min-h-[100svh] w-full flex-col border-b-2 border-[#0A0A0A] bg-[#0A0A0A] text-white"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#0A0A0A]" />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 min-h-full w-full opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "clamp(20px, 4vw, 32px) clamp(20px, 4vw, 32px)",
            backgroundPosition: "center center",
          }}
        />

        <div className="relative mx-auto flex h-full w-full max-w-5xl flex-1 flex-col justify-center px-5 py-10 sm:px-8 sm:py-12">
          <div className="mb-10 flex items-center justify-center gap-4 border-b border-white/10 pb-5 sm:mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#FF3333]">
              Proof
            </p>
            <div className="h-px w-12 bg-white/20 sm:w-24" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
              Shyara Marketing
            </p>
          </div>

          <ol className="flex flex-col items-center gap-7 sm:gap-9">
            {stats.map((s, i) => (
              <StatRow
                key={s.label}
                value={s.value}
                label={s.label}
                direction={s.direction}
                range={s.range}
                scrollYProgress={scrollYProgress}
                reduceMotion={reduceMotion}
                testId={`social-proof-stat-${i + 1}`}
              />
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
};
