import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollSection } from "@/components/marketing/motion/ScrollSection";
import { ScrollLottie } from "@/components/marketing/motion/ScrollLottie";
import { HomeAmbientLayer } from "./HomeAmbientLayer";
import { homeHero } from "@/content/home";
import { homeLottie } from "@/lib/homeLottie";
import { openWhatsApp, homeWhatsAppMessages } from "@/lib/whatsapp";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/components/marketing/motion/motionPresets";

/** One screen below the fixed h-16 site header — avoids double viewport + spacer push-down */
const HERO_MIN_H = "min-h-[calc(100dvh-4rem)]";

export function HomeHero() {
  const scopeRef = useRef<HTMLElement>(null);
  const orbARef = useRef<HTMLDivElement>(null);
  const orbBRef = useRef<HTMLDivElement>(null);
  const orbCRef = useRef<HTMLDivElement>(null);
  const lottieWrapRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope) return;

      const heroParts = scope.querySelectorAll<HTMLElement>("[data-hero-part]");
      const settleHeroParts = () => {
        gsap.set(heroParts, {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          filter: "none",
          visibility: "visible",
          clearProps: "opacity,transform,filter,visibility",
        });
      };

      if (prefersReducedMotion()) {
        settleHeroParts();
        return;
      }

      const lines = scope.querySelectorAll<HTMLElement>("[data-hero-line]");

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", immediateRender: false },
        onComplete: settleHeroParts,
      });

      tl.from(scope.querySelector("[data-hero-label]"), {
        opacity: 0,
        y: 12,
        duration: 0.5,
      })
        .from(
          lines,
          {
            opacity: 0,
            y: 32,
            scale: 0.96,
            filter: "blur(6px)",
            duration: 0.7,
            stagger: 0.12,
          },
          "-=0.2"
        )
        .from(
          scope.querySelector("[data-hero-sub]"),
          { opacity: 0, y: 16, duration: 0.5 },
          "-=0.35"
        );

      [orbARef, orbBRef, orbCRef].forEach((ref, i) => {
        if (!ref.current) return;
        gsap.to(ref.current, {
          y: i % 2 === 0 ? 18 : -12,
          x: i === 1 ? -10 : 8,
          rotation: i === 2 ? 4 : 0,
          duration: 5 + i * 1.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      if (lottieWrapRef.current) {
        gsap.to(lottieWrapRef.current, {
          rotation: 6,
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      }

      if (scrollCueRef.current) {
        gsap.to(scrollCueRef.current, {
          y: 6,
          opacity: 0.45,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    },
    { scope: scopeRef }
  );

  return (
    <ScrollSection
      ref={scopeRef}
      section="hero"
      className={cnHeroShell()}
    >
      <HomeAmbientLayer variant="hero" />
      <div
        ref={orbARef}
        data-parallax
        data-parallax-speed="0.2"
        className="home-orb-drift pointer-events-none absolute -left-16 top-[12%] h-48 w-48 rounded-full bg-brand-emerald/15 blur-3xl md:h-64 md:w-64"
        aria-hidden
      />
      <div
        ref={orbBRef}
        data-parallax
        data-parallax-speed="0.35"
        className="home-orb-drift-slow pointer-events-none absolute -right-12 top-[28%] h-40 w-40 rounded-full bg-brand-sky/15 blur-3xl md:h-56 md:w-56"
        aria-hidden
      />
      <div
        ref={orbCRef}
        className="pointer-events-none absolute left-1/2 bottom-[18%] h-32 w-32 -translate-x-1/2 rounded-full bg-brand-violet/12 blur-3xl md:h-44 md:w-44"
        aria-hidden
      />

      {/* Decorative Lottie — out of document flow so it does not push copy down */}
      <div
        ref={lottieWrapRef}
        data-parallax
        data-parallax-speed="0.15"
        className="pointer-events-none absolute left-1/2 top-[40%] z-0 h-44 w-44 -translate-x-1/2 -translate-y-1/2 opacity-70 sm:h-52 sm:w-52 md:top-[42%] md:h-60 md:w-60 md:opacity-75"
        aria-hidden
      >
        <ScrollLottie
          src={homeLottie.hero}
          triggerRef={scopeRef}
          start="top top"
          end="bottom top"
          scrub={0.35}
          className="h-full w-full"
        />
      </div>

      <div
        className={`container relative z-10 flex ${HERO_MIN_H} flex-col items-center justify-center px-4 py-8 text-center sm:py-10`}
      >
        <p
          data-hero-label
          data-hero-part
          className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-emerald"
        >
          {homeHero.label}
        </p>

        <h1 className="font-display max-w-3xl text-balance font-extrabold text-display-clamp text-foreground">
          {homeHero.headlineLines.map((line, i) => (
            <span
              key={line}
              data-hero-line
              data-hero-part
              className={cn("block", i === 1 && "home-accent-line")}
            >
              {line}
            </span>
          ))}
        </h1>

        <p
          data-hero-sub
          data-hero-part
          className="mt-4 max-w-md text-base text-muted-foreground md:text-lg"
        >
          {homeHero.subline}
        </p>

        <ul
          className="mt-5 flex w-full max-w-xl flex-col gap-1.5 text-sm sm:mt-6 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-2 md:text-base"
          aria-label="What your website delivers"
        >
          {homeHero.outcomes.map((item, i) => (
            <li key={item} className="flex items-center gap-2 sm:contents">
              {i > 0 && (
                <span className="hidden text-muted-foreground/35 sm:inline" aria-hidden>
                  ·
                </span>
              )}
              <span
                className="rounded-lg border border-border/50 bg-background/75 px-3 py-2 font-medium text-foreground/90 backdrop-blur-sm transition-colors hover:border-brand-emerald/40 sm:rounded-full sm:border-border/40 sm:px-3 sm:py-1.5"
              >
                {item}
              </span>
            </li>
          ))}
        </ul>

        <motion.div
          data-hero-cta
          data-hero-part
          className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5, ease: easeOutExpo }}
        >
          <motion.div whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
            <Button
              size="lg"
              className="home-cta-pulse min-h-[48px] w-full gap-2 bg-brand-coral text-white shadow-md shadow-brand-coral/20 hover:bg-brand-coral/90 sm:w-auto"
              onClick={() => openWhatsApp(homeWhatsAppMessages.hero)}
            >
              <MessageCircle className="h-5 w-5" />
              {homeHero.primaryCta}
            </Button>
          </motion.div>
          <motion.div whileHover={reduceMotion ? undefined : { scale: 1.02 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
            <Button size="lg" variant="outline" className="min-h-[48px] w-full gap-2 sm:w-auto" asChild>
              <Link to="/samples">
                {homeHero.secondaryCta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <div
        ref={scrollCueRef}
        className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-muted-foreground/60"
        aria-hidden
      >
        <span className="h-6 w-px bg-gradient-to-b from-transparent via-brand-emerald/50 to-brand-emerald/80" />
        <ChevronDown className="h-4 w-4" />
      </div>
    </ScrollSection>
  );
}

function cnHeroShell() {
  return `gradient-hero relative flex ${HERO_MIN_H} overflow-hidden`;
}
