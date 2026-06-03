import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ScrollLottieProps {
  src: string;
  className?: string;
  /** Element that drives scroll progress; defaults to the lottie wrapper */
  triggerRef?: RefObject<HTMLElement | null>;
  start?: string;
  end?: string;
  scrub?: number | boolean;
  /** When set, maps global 0–1 pin progress to this segment only */
  segmentIndex?: number;
  segmentCount?: number;
  segmentProgress?: number;
  fallback?: ReactNode;
  decorative?: boolean;
}

function segmentLocalProgress(global: number, index: number, count: number) {
  const slice = 1 / count;
  const start = index * slice;
  return Math.min(1, Math.max(0, (global - start) / slice));
}

export function ScrollLottie({
  src,
  className,
  triggerRef,
  start = "top 88%",
  end = "bottom 12%",
  scrub = 0.45,
  segmentIndex,
  segmentCount,
  segmentProgress,
  fallback,
  decorative = true,
}: ScrollLottieProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const totalFramesRef = useRef(90);
  const useSegment =
    segmentProgress != null && segmentIndex != null && segmentCount != null && segmentCount > 0;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cancelled = false;
    fetch(src)
      .then((res) => res.json())
      .then((data: { op?: number; ip?: number }) => {
        if (cancelled) return;
        setAnimationData(data);
        const op = typeof data.op === "number" ? data.op : 90;
        const ip = typeof data.ip === "number" ? data.ip : 0;
        totalFramesRef.current = Math.max(1, op - ip);
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  const applyFrame = (progress: number) => {
    const frame = progress * (totalFramesRef.current - 1);
    lottieRef.current?.goToAndStop(frame, true);
  };

  useEffect(() => {
    if (!useSegment || !animationData || prefersReducedMotion()) return;
    const local = segmentLocalProgress(segmentProgress!, segmentIndex!, segmentCount!);
    const id = requestAnimationFrame(() => applyFrame(local));
    return () => cancelAnimationFrame(id);
  }, [useSegment, segmentProgress, segmentIndex, segmentCount, animationData]);

  useGSAP(
    () => {
      if (useSegment || !animationData || prefersReducedMotion()) return;

      const trigger = triggerRef?.current ?? wrapRef.current;
      if (!trigger) return;

      const st = ScrollTrigger.create({
        trigger,
        start,
        end,
        scrub: typeof scrub === "number" ? scrub : true,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyFrame(self.progress),
      });

      const id = requestAnimationFrame(() => applyFrame(0));

      return () => {
        cancelAnimationFrame(id);
        st.kill();
      };
    },
    {
      scope: wrapRef,
      dependencies: [animationData, useSegment, start, end, scrub],
    }
  );

  if (prefersReducedMotion()) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          decorative && "pointer-events-none select-none",
          className
        )}
        aria-hidden={decorative}
      >
        {fallback ?? <div className="h-full w-full rounded-full bg-brand-emerald/15" />}
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative flex items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full",
        decorative && "pointer-events-none select-none",
        className
      )}
      aria-hidden={decorative}
    >
      {animationData ? (
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          autoplay={false}
          loop={false}
          className="h-full w-full"
        />
      ) : (
        fallback ?? (
          <div
            className="h-full w-full animate-pulse rounded-full bg-gradient-to-br from-brand-emerald/20 to-brand-sky/20"
            aria-hidden
          />
        )
      )}
    </div>
  );
}
