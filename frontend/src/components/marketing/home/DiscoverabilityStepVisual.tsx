import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { Bot, MapPinned, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { brandToneClasses, type BrandTone } from "@/lib/brandColors";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

const stepIcons = {
  seo: Search,
  aeo: Bot,
  geo: MapPinned,
} as const;

interface DiscoverabilityStepVisualProps {
  stepId: keyof typeof stepIcons;
  lottieSrc: string;
  tone: BrandTone;
  isActive: boolean;
}

export function DiscoverabilityStepVisual({
  stepId,
  lottieSrc,
  tone,
  isActive,
}: DiscoverabilityStepVisualProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const Icon = stepIcons[stepId] ?? Search;
  const reduced = prefersReducedMotion();

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap || reduced) return;
      gsap.fromTo(
        wrap,
        { scale: isActive ? 0.92 : 0.88 },
        { scale: isActive ? 1 : 0.88, duration: 0.5, ease: "back.out(1.5)" }
      );
    },
    { dependencies: [isActive], scope: wrapRef }
  );

  useEffect(() => {
    if (reduced || !lottieRef.current) return;
    if (isActive) {
      lottieRef.current.play();
    } else {
      lottieRef.current.pause();
      lottieRef.current.goToAndStop(0, true);
    }
  }, [isActive, reduced]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative mx-auto mb-4 flex h-28 w-28 items-center justify-center sm:mb-5 sm:h-32 sm:w-32",
        isActive && "home-glow-ring"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-2xl transition-opacity duration-500",
          brandToneClasses[tone].well,
          isActive ? "opacity-90" : "opacity-20"
        )}
        aria-hidden
      />
      <div
        className={cn(
          "absolute inset-1 rounded-full border-2 transition-all duration-500",
          brandToneClasses[tone].ring,
          isActive ? "opacity-100" : "opacity-25"
        )}
        aria-hidden
      />
      {!reduced && (
        <Lottie
          lottieRef={lottieRef}
          path={lottieSrc}
          autoplay={false}
          loop
          className={cn(
            "absolute inset-0 h-full w-full transition-opacity duration-500",
            isActive ? "opacity-100" : "opacity-0"
          )}
        />
      )}
      <div
        className={cn(
          "relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border bg-background/95 shadow-sm sm:h-16 sm:w-16",
          brandToneClasses[tone].ring,
          isActive && "shadow-md ring-2"
        )}
      >
        <Icon className={cn("h-7 w-7 sm:h-8 sm:w-8", brandToneClasses[tone].text)} aria-hidden />
      </div>
    </div>
  );
}
