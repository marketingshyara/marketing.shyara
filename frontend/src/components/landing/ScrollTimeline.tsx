import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useMotionValueEvent } from "framer-motion";
import type { LucideIcon } from "lucide-react";

const DOT_X = [0.25, 0.75, 0.25, 0.75];

const buildPath = (w: number, h: number) =>
  `M ${0.5 * w} 0 ` +
  `C ${0.5 * w} ${0.06 * h} ${0.25 * w} ${0.06 * h} ${0.25 * w} ${0.125 * h} ` +
  `C ${0.25 * w} ${0.19 * h} ${0.75 * w} ${0.28 * h} ${0.75 * w} ${0.375 * h} ` +
  `C ${0.75 * w} ${0.47 * h} ${0.25 * w} ${0.53 * h} ${0.25 * w} ${0.625 * h} ` +
  `C ${0.25 * w} ${0.72 * h} ${0.75 * w} ${0.78 * h} ${0.75 * w} ${0.875 * h}`;

type TimelineStep = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export const ScrollTimeline = ({ steps }: { steps: TimelineStep[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const el = deskRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.5"],
  });
  const pathLength = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });

  useMotionValueEvent(pathLength, "change", (v) => {
    let idx = -1;
    steps.forEach((_, i) => {
      if (v >= i * 0.25 + 0.1) idx = i;
    });
    setActive((prev) => (prev === idx ? prev : idx));
  });

  return (
    <div ref={ref} data-testid="process-timeline" className="relative">
      <div ref={deskRef} className="relative hidden md:block">
        {dims.w > 0 && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${dims.w} ${dims.h}`}
            fill="none"
            aria-hidden="true"
          >
            <path
              d={buildPath(dims.w, dims.h)}
              stroke="#0A0A0A"
              strokeOpacity="0.1"
              strokeWidth="3"
              strokeDasharray="2 10"
              strokeLinecap="round"
            />
            <motion.path
              d={buildPath(dims.w, dims.h)}
              stroke="#FF3333"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ pathLength }}
            />
          </svg>
        )}

        {steps.map((s, i) => {
          const isActive = active >= i;
          const Icon = s.icon;
          return (
            <div key={s.title} className="relative flex h-72 items-center">
              <div
                data-testid={`timeline-dot-${i + 1}`}
                className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${DOT_X[i] * 100}%` }}
              >
                <span
                  className={`block h-5 w-5 rotate-45 border-2 border-[#0A0A0A] transition-all duration-500 ${
                    isActive ? "scale-125 bg-[#FF3333]" : "bg-white"
                  }`}
                />
              </div>

              <div
                data-testid={`process-step-${i + 1}`}
                className={`absolute top-1/2 w-[38%] -translate-y-1/2 border-2 bg-white p-7 transition-all duration-500 ${
                  isActive
                    ? "border-[#0A0A0A] opacity-100 shadow-[5px_5px_0px_0px_#0a0a0a]"
                    : "border-[#0A0A0A]/20 opacity-40"
                } ${i % 2 === 0 ? "left-[31%]" : "right-[31%]"}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-heading text-4xl font-black tracking-tighter transition-colors duration-500 ${
                      isActive ? "text-[#FF3333]" : "text-[#0A0A0A]/15"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <Icon
                    size={24}
                    strokeWidth={2}
                    className={isActive ? "text-[#FF3333]" : "text-[#0A0A0A]/30"}
                  />
                </div>
                <h3 className="font-heading mt-3 text-xl font-black tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#0A0A0A]/60">{s.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative pl-12 md:hidden">
        <div className="absolute bottom-2 left-[9px] top-2 w-[3px] bg-[#0A0A0A]/10" />
        <motion.div
          className="absolute bottom-2 left-[9px] top-2 w-[3px] origin-top bg-[#FF3333]"
          style={{ scaleY: pathLength }}
        />
        {steps.map((s, i) => {
          const isActive = active >= i;
          const Icon = s.icon;
          return (
            <div key={s.title} className="relative pb-12 last:pb-0">
              <span
                className={`absolute left-[calc(10.5px_-_3rem)] top-1 block h-5 w-5 -translate-x-1/2 rotate-45 border-2 border-[#0A0A0A] transition-all duration-500 ${
                  isActive ? "scale-110 bg-[#FF3333]" : "bg-white"
                }`}
              />
              <div
                className={`border-2 bg-white p-6 transition-all duration-500 ${
                  isActive
                    ? "border-[#0A0A0A] opacity-100 shadow-[4px_4px_0px_0px_#0a0a0a]"
                    : "border-[#0A0A0A]/20 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-heading text-3xl font-black tracking-tighter ${
                      isActive ? "text-[#FF3333]" : "text-[#0A0A0A]/15"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <Icon size={22} strokeWidth={2} className={isActive ? "text-[#FF3333]" : "text-[#0A0A0A]/30"} />
                </div>
                <h3 className="font-heading mt-3 text-lg font-black tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#0A0A0A]/60">{s.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
