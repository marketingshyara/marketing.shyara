import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, MessageCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollSection } from "@/components/marketing/motion/ScrollSection";
import { homeHero } from "@/content/home";
import { openWhatsApp, homeWhatsAppMessages } from "@/lib/whatsapp";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/components/marketing/motion/motionPresets";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HomeHero() {
  const scopeRef = useRef<HTMLElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const contentLayerRef = useRef<HTMLDivElement>(null);
  const blobARef = useRef<HTMLDivElement>(null);
  const blobBRef = useRef<HTMLDivElement>(null);
  const floatARef = useRef<HTMLDivElement>(null);
  const floatBRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
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
          visibility: "visible",
          clearProps: "opacity,transform,visibility",
        });
      };

      if (prefersReducedMotion()) {
        settleHeroParts();
        return;
      }

      const loadTl = gsap.timeline({
        defaults: { ease: "power3.out", immediateRender: false },
        onComplete: settleHeroParts,
      });

      loadTl
        .from(scope.querySelector("[data-hero-headline]"), {
          opacity: 0,
          y: 28,
          duration: 0.7,
        })
        .from(
          scope.querySelector("[data-hero-sub]"),
          { opacity: 0, y: 16, duration: 0.5 },
          "-=0.35"
        )
        .from(
          scope.querySelector("[data-hero-cta]"),
          { opacity: 0, y: 14, duration: 0.45 },
          "-=0.2"
        )
        .from(
          scope.querySelector("[data-hero-proof]"),
          { opacity: 0, y: 12, duration: 0.4 },
          "-=0.15"
        );

      [blobARef, blobBRef].forEach((ref, i) => {
        if (!ref.current) return;
        gsap.to(ref.current, {
          y: i === 0 ? 18 : -14,
          scale: i === 0 ? 1.03 : 1.02,
          duration: i === 0 ? 8 : 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      [floatARef, floatBRef].forEach((ref, i) => {
        if (!ref.current) return;
        gsap.to(ref.current, {
          y: i === 0 ? -10 : 8,
          duration: i === 0 ? 6 : 7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.2 + i * 0.3,
        });
      });

      const contentLayer = contentLayerRef.current;
      const bgLayer = bgLayerRef.current;
      const marquee = marqueeRef.current;

      if (contentLayer) {
        gsap.to(contentLayer, {
          y: () => -window.innerHeight * 0.18,
          opacity: 0,
          scale: 0.97,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "bottom top",
            scrub: 0.85,
          },
        });
      }

      if (bgLayer) {
        gsap.to(bgLayer, {
          y: () => window.innerHeight * 0.14,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (marquee) {
        gsap.to(marquee, {
          opacity: 0,
          y: 24,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "center top",
            scrub: 0.5,
          },
        });
      }

      scope.querySelectorAll<HTMLElement>("[data-hero-parallax]").forEach((el) => {
        const speed = Number(el.dataset.heroParallax ?? "0.3");
        gsap.fromTo(
          el,
          { y: -speed * 36 },
          {
            y: speed * 48,
            ease: "none",
            scrollTrigger: {
              trigger: scope,
              start: "top top",
              end: "bottom top",
              scrub: 0.65,
            },
          }
        );
      });
    },
    { scope: scopeRef }
  );

  const marqueeItems = [...homeHero.marquee, ...homeHero.marquee];

  return (
    <ScrollSection
      ref={scopeRef}
      section="hero"
      className={cn(
        "hero-wom relative -mt-16 flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden bg-background md:-mt-[4.25rem]"
      )}
    >
      <div ref={bgLayerRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="hero-wom-dot-grid absolute inset-0" />
        <div ref={blobARef} data-hero-parallax="0.45" className="hero-wom-blob-a absolute" />
        <div ref={blobBRef} data-hero-parallax="0.35" className="hero-wom-blob-b absolute" />
      </div>

      <div
        ref={floatARef}
        data-hero-parallax
        data-hero-parallax="0.55"
        className="hero-wom-float-card pointer-events-none absolute right-[4%] top-[34%] z-[8] hidden min-w-[11.5rem] rounded-2xl border border-brand-emerald/15 bg-card px-5 py-4 shadow-[0_12px_40px_rgb(0_0_0/0.07)] lg:block"
        aria-hidden
      >
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground/70">
          {homeHero.floatCards.stat.label}
        </p>
        <p className="font-display text-[1.65rem] font-bold leading-none text-brand-teal">
          {homeHero.floatCards.stat.value}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/80">{homeHero.floatCards.stat.sub}</p>
      </div>
      <div
        ref={floatBRef}
        data-hero-parallax
        data-hero-parallax="0.4"
        className="hero-wom-float-card-dark pointer-events-none absolute left-[3%] top-[38%] z-[8] hidden min-w-[10rem] rounded-[14px] bg-brand-teal px-4 py-3.5 shadow-lg lg:block"
        aria-hidden
      >
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white/50">
          {homeHero.floatCards.chart.label}
        </p>
        <p className="font-display text-[1.6rem] font-bold leading-none text-white">
          {homeHero.floatCards.chart.value}
        </p>
        <div className="mt-2 flex h-6 items-end gap-0.5" aria-hidden>
          {homeHero.floatCards.chart.bars.map((h, i) => (
            <span
              key={i}
              className={cn(
                "w-1.5 rounded-sm",
                i >= homeHero.floatCards.chart.activeFrom
                  ? "bg-brand-coral/90"
                  : "bg-white/25"
              )}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <div
        ref={contentLayerRef}
        data-hero-scroll-content
        className="relative z-[5] flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 sm:py-24 md:px-10"
      >
        <h1
          data-hero-headline
          data-hero-part
          className="hero-wom-headline font-display max-w-[54rem] text-balance font-black leading-[1.08] tracking-[-0.03em] text-foreground"
        >
          {homeHero.headline}
          <span className="hero-wom-highlight relative inline-block">{homeHero.headlineHighlight}</span>
          {homeHero.headlineSuffix}
        </h1>

        <p
          data-hero-sub
          data-hero-part
          className="mt-5 max-w-[30rem] text-base font-light leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg"
        >
          {homeHero.subline}
        </p>

        <motion.div
          data-hero-cta
          data-hero-part
          className="mt-8 flex w-full max-w-sm flex-col items-center gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease: easeOutExpo }}
        >
          <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
            <Button
              size="lg"
              className="h-auto min-h-[48px] w-full rounded-full bg-brand-coral px-8 py-3.5 text-[15px] font-medium text-white shadow-none hover:bg-brand-coral/90 hover:shadow-[0_8px_24px_hsl(var(--brand-coral)/0.28)] sm:w-auto"
              onClick={() => openWhatsApp(homeWhatsAppMessages.hero)}
            >
              <MessageCircle className="h-4 w-4" />
              {homeHero.primaryCta}
            </Button>
          </motion.div>
          <motion.div whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
            <Button
              size="lg"
              variant="outline"
              className="h-auto min-h-[48px] w-full gap-2 rounded-full border-[1.5px] border-brand-emerald/25 bg-transparent px-7 py-3.5 text-[15px] font-medium text-brand-teal hover:border-brand-emerald/50 hover:bg-transparent sm:w-auto"
              asChild
            >
              <Link to="/samples">
                <Play className="h-4 w-4 fill-current" aria-hidden />
                {homeHero.secondaryCta}
                <ArrowRight className="h-4 w-4 opacity-70" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <p
          data-hero-proof
          data-hero-part
          className="mt-8 text-[13px] font-medium text-muted-foreground sm:mt-10"
        >
          {homeHero.socialProof}
        </p>

      </div>

      <div
        data-hero-scroll-cue
        className="pointer-events-none absolute bottom-[4.75rem] left-1/2 z-[6] flex -translate-x-1/2 flex-col items-center gap-1 text-muted-foreground/50 sm:bottom-[5.25rem]"
        aria-hidden
      >
        <span className="text-[11px] font-medium uppercase tracking-[0.14em]">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>

      <div
        ref={marqueeRef}
        className="hero-wom-marquee relative z-[5] mt-auto w-full shrink-0 overflow-hidden border-t border-brand-emerald/10 py-4 sm:py-6"
      >
        <div
          className={cn(
            "hero-wom-marquee-track flex w-max gap-12 whitespace-nowrap",
            reduceMotion && "motion-reduce:animate-none"
          )}
          aria-hidden
        >
          {marqueeItems.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex items-center gap-2.5 text-[13px] font-normal uppercase tracking-[0.04em] text-muted-foreground/50"
            >
              <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-brand-coral/60" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </ScrollSection>
  );
}
