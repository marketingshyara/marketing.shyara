import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "framer-motion";
import { ScrollSection } from "@/components/marketing/motion/ScrollSection";
import { usePinnedScrollStack } from "@/components/marketing/motion/usePinnedScrollStack";
import { useRevealOnScroll } from "@/components/marketing/motion/useRevealOnScroll";
import { HomeAmbientLayer } from "./HomeAmbientLayer";
import { DiscoverabilityStepVisual } from "./DiscoverabilityStepVisual";
import { HomeSectionLabel } from "./HomeSectionLabel";
import { homeDiscoverability } from "@/content/home";
import { homeLottie } from "@/lib/homeLottie";
import { brandToneClasses } from "@/lib/brandColors";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import { cn } from "@/lib/utils";

const stepLottie: Record<string, string> = {
  seo: homeLottie.discoverability.seo,
  aeo: homeLottie.discoverability.aeo,
  geo: homeLottie.discoverability.geo,
};

/** Explicit height — flex-1 alone collapses to 0 before pin measures */
const CARD_STACK_H = "h-[min(48dvh,400px)] min-h-[280px]";

export function HomeDiscoverability() {
  const scopeRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRevealOnScroll({ start: "top 88%", stagger: 0.08 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [pinProgress, setPinProgress] = useState(0);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || !trackRef.current) return;
      const panels = trackRef.current.querySelectorAll<HTMLElement>("[data-stack-panel]");
      panels.forEach((panel, i) => {
        gsap.to(panel, {
          scale: i === activeIndex ? 1 : 0.98,
          opacity: i === activeIndex ? 1 : 0.72,
          duration: 0.45,
          ease: "power2.out",
        });
      });
    },
    { dependencies: [activeIndex], scope: trackRef }
  );

  const progressRef = usePinnedScrollStack(pinRef, viewportRef, trackRef, {
    stepCount: homeDiscoverability.steps.length,
    onProgress: (progress, idx) => {
      setPinProgress(progress);
      setActiveIndex(idx);
    },
  });

  return (
    <ScrollSection ref={scopeRef} section="discoverability" className="surface-sky">
      <div ref={pinRef} className="relative surface-sky pt-16">
        <HomeAmbientLayer variant="sky" showMesh={false} className="z-0" />
        <div
          ref={headerRef}
          className="relative z-10 shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-sm dark:bg-background/70"
        >
          <div className="container max-w-3xl px-4 pb-4 pt-6 text-center sm:pt-8 sm:pb-5">
            <HomeSectionLabel className="block text-center">{homeDiscoverability.label}</HomeSectionLabel>
            <h2 data-reveal className="font-display text-hero-clamp mb-2 font-bold text-foreground">
              {homeDiscoverability.headline}
            </h2>
            <p data-reveal className="text-sm text-muted-foreground md:text-base">
              {homeDiscoverability.subline}
            </p>

            <div className="mt-5 flex items-center gap-3 sm:mt-6" aria-hidden>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  ref={progressRef}
                  className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-brand-emerald via-brand-sky to-brand-violet"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
              <div className="flex shrink-0 gap-2">
                {homeDiscoverability.steps.map(({ id, title, tone }, i) => (
                  <motion.span
                    key={id}
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            scale: activeIndex === i ? 1.08 : 1,
                            opacity: activeIndex === i ? 1 : 0.45,
                          }
                    }
                    transition={{ duration: 0.35 }}
                    className={cn(
                      "min-w-[2rem] text-center text-[10px] font-semibold uppercase tracking-wider sm:min-w-0",
                      activeIndex === i ? brandToneClasses[tone].text : "text-muted-foreground/40"
                    )}
                  >
                    {title}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container relative z-10 max-w-3xl px-4 pb-10 pt-4 md:pb-12">
          <div
            ref={viewportRef}
            className={cn(
              CARD_STACK_H,
              "relative overflow-hidden rounded-2xl shadow-inner ring-1 ring-border/40"
            )}
          >
            <div ref={trackRef} className="flex flex-col will-change-transform">
              {homeDiscoverability.steps.map(({ id, title, subtitle, description, tone }, i) => (
                <article
                  key={id}
                  data-stack-panel
                  className={cn(
                    "flex shrink-0 flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/90 px-5 py-4 text-center shadow-sm backdrop-blur-sm sm:px-8 dark:bg-card/80",
                    brandToneClasses[tone].ring,
                    activeIndex === i ? "border-opacity-100 shadow-lg" : "border-opacity-50"
                  )}
                >
                  <DiscoverabilityStepVisual
                    stepId={id as "seo" | "aeo" | "geo"}
                    lottieSrc={stepLottie[id] ?? homeLottie.discoverability.seo}
                    tone={tone}
                    isActive={activeIndex === i}
                  />
                  <p
                    className={cn(
                      "mb-2 text-[11px] font-semibold uppercase tracking-[0.18em]",
                      brandToneClasses[tone].text
                    )}
                  >
                    {subtitle}
                  </p>
                  <h3 className="font-display mb-3 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                    {title}
                  </h3>
                  <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                    {description}
                  </p>
                </article>
              ))}
            </div>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background via-background/80 to-transparent"
              aria-hidden
            />
          </div>

          <p className="mt-3 text-center text-[11px] text-muted-foreground/70" aria-hidden>
            {activeIndex + 1} of {homeDiscoverability.steps.length}
            {pinProgress > 0.02 && pinProgress < 0.98 ? " · keep scrolling" : ""}
          </p>
        </div>
      </div>
    </ScrollSection>
  );
}
