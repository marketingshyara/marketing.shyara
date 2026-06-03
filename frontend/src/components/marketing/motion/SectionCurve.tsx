import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import type { BrandTone } from "@/lib/brandColors";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const strokeMap: Record<BrandTone, string> = {
  emerald: "hsl(160 84% 39%)",
  sky: "hsl(199 89% 48%)",
  amber: "hsl(38 92% 50%)",
  coral: "hsl(15 85% 58%)",
  violet: "hsl(262 70% 55%)",
  teal: "hsl(173 72% 38%)",
};

interface SectionCurveProps {
  tone?: BrandTone;
  className?: string;
  flip?: boolean;
}

export function SectionCurve({ tone = "emerald", className, flip = false }: SectionCurveProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const path = pathRef.current;
      const wrap = wrapRef.current;
      if (!path || !wrap) return;

      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      if (prefersReducedMotion()) {
        gsap.set(path, { strokeDashoffset: 0 });
        return;
      }

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top 90%",
          end: "bottom 60%",
          scrub: 0.6,
        },
      });
    },
    { scope: wrapRef }
  );

  return (
    <div
      ref={wrapRef}
      className={cn("pointer-events-none w-full overflow-hidden leading-[0]", flip && "rotate-180", className)}
      aria-hidden
    >
      <svg viewBox="0 0 1440 48" fill="none" className="w-full h-8 md:h-12" preserveAspectRatio="none">
        <path
          ref={pathRef}
          d="M0 24 C360 48 720 0 1080 24 C1260 36 1380 12 1440 24"
          stroke={strokeMap[tone]}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity={0.45}
        />
      </svg>
    </div>
  );
}
