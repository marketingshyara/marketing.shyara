import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "framer-motion";
import { Bot, MapPinned, MessageCircle, Search, type LucideIcon } from "lucide-react";
import { ScrollSection } from "@/components/marketing/motion/ScrollSection";
import { ScrollLottie } from "@/components/marketing/motion/ScrollLottie";
import { MotionReveal } from "@/components/marketing/motion/MotionReveal";
import { StaggerChildren, StaggerItem } from "@/components/marketing/motion/StaggerChildren";
import { HomeAmbientLayer } from "./HomeAmbientLayer";
import { HomeSectionLabel } from "./HomeSectionLabel";
import { HomeSectionShell } from "./HomeSectionShell";
import { homeOutcomes } from "@/content/home";
import { homeLottie } from "@/lib/homeLottie";
import { brandToneClasses, type BrandTone } from "@/lib/brandColors";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import { easeOutExpo } from "@/components/marketing/motion/motionPresets";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const outcomeIcons: Record<string, LucideIcon> = {
  found: Search,
  trusted: MapPinned,
  recommended: Bot,
  contacted: MessageCircle,
};

const outcomeLottieSrc: Record<string, string> = {
  found: homeLottie.outcomes.found,
  trusted: homeLottie.outcomes.trusted,
  recommended: homeLottie.outcomes.recommended,
  contacted: homeLottie.outcomes.contacted,
};

function OutcomeCard({
  id,
  title,
  description,
  tone,
}: {
  id: string;
  title: string;
  description: string;
  tone: BrandTone;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const Icon = outcomeIcons[id] ?? Search;
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card || prefersReducedMotion()) return;

      gsap.to(card.querySelector("[data-outcome-well]"), {
        scale: 1.08,
        opacity: 0.85,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          once: true,
        },
      });
    },
    { scope: cardRef }
  );

  return (
    <StaggerItem>
      <motion.article
        ref={cardRef}
        data-outcome
        whileHover={
          reduce
            ? undefined
            : {
                y: -6,
                scale: 1.02,
                transition: { duration: 0.35, ease: easeOutExpo },
              }
        }
        className={cn(
          "home-card-lift group flex flex-col items-center rounded-2xl border border-border/60 bg-background/95 p-5 text-center backdrop-blur-sm md:p-6",
          brandToneClasses[tone].border
        )}
      >
        <div className="relative mb-4 flex h-20 w-20 items-center justify-center sm:h-[5.5rem] sm:w-[5.5rem]">
          <div
            data-outcome-well
            className={cn(
              "absolute inset-0 rounded-full opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-80",
              brandToneClasses[tone].well
            )}
            aria-hidden
          />
          <ScrollLottie
            src={outcomeLottieSrc[id] ?? homeLottie.outcomes.found}
            triggerRef={cardRef}
            start="top 92%"
            end="bottom 8%"
            scrub={0.4}
            className="absolute inset-0 h-full w-full opacity-90"
          />
          <motion.div
            className={cn(
              "relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border bg-background/95 shadow-sm",
              brandToneClasses[tone].ring
            )}
            whileHover={reduce ? undefined : { rotate: [0, -6, 6, 0], transition: { duration: 0.5 } }}
          >
            <Icon className={cn("h-6 w-6", brandToneClasses[tone].text)} aria-hidden />
          </motion.div>
        </div>
        <h3 className={cn("font-display mb-1.5 text-base font-bold md:text-lg", brandToneClasses[tone].text)}>
          {title}
        </h3>
        <p className="text-xs leading-snug text-muted-foreground md:text-sm">{description}</p>
      </motion.article>
    </StaggerItem>
  );
}

export function HomeOutcomes() {
  const scopeRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope || prefersReducedMotion()) return;

      gsap.from(scope.querySelector("[data-outcomes-headline]"), {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scope.querySelector("[data-outcomes-intro]"),
          start: "top 82%",
          once: true,
        },
      });
    },
    { scope: scopeRef }
  );

  return (
    <ScrollSection ref={scopeRef} section="outcomes">
      <HomeSectionShell tint="warm" className="relative overflow-hidden">
        <HomeAmbientLayer variant="warm" showMesh={false} />
        <div data-outcomes-intro className="relative mb-10 text-center md:mb-12">
          <MotionReveal>
            <HomeSectionLabel>{homeOutcomes.label}</HomeSectionLabel>
          </MotionReveal>
          <h2
            data-outcomes-headline
            className="font-display text-hero-clamp font-bold text-foreground"
          >
            {homeOutcomes.headline}
          </h2>
        </div>

        <StaggerChildren className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {homeOutcomes.items.map((item) => (
            <OutcomeCard key={item.id} {...item} />
          ))}
        </StaggerChildren>
      </HomeSectionShell>
    </ScrollSection>
  );
}
