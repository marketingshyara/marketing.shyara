import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollSection } from "@/components/marketing/motion/ScrollSection";
import { useRevealOnScroll } from "@/components/marketing/motion/useRevealOnScroll";
import { ScrollLottie } from "@/components/marketing/motion/ScrollLottie";
import { HomeAmbientLayer } from "./HomeAmbientLayer";
import { homeLottie } from "@/lib/homeLottie";
import { homeFinalCta } from "@/content/home";
import { openWhatsApp, homeWhatsAppMessages } from "@/lib/whatsapp";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import { easeOutExpo } from "@/components/marketing/motion/motionPresets";

export function HomeFinalCta() {
  const scopeRef = useRevealOnScroll({ direction: "up", stagger: 0.12 });
  const lottieWrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      const wrap = lottieWrapRef.current;
      const scope = scopeRef.current;
      if (!wrap || !scope || prefersReducedMotion()) return;

      gsap.to(wrap, {
        y: -24,
        rotation: -8,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    },
    { scope: scopeRef }
  );

  return (
    <ScrollSection ref={scopeRef} section="cta" className="gradient-cta relative overflow-hidden border-t border-brand-teal/25">
      <HomeAmbientLayer variant="cta" />
      <div
        className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, hsl(0 0% 100% / 0.15) 0%, transparent 45%), radial-gradient(circle at 70% 80%, hsl(var(--brand-amber) / 0.2) 0%, transparent 40%)",
        }}
        aria-hidden
      />
      <div className="container relative max-w-3xl px-4 py-16 text-center md:py-20">
        <div
          ref={lottieWrapRef}
          data-parallax
          data-parallax-speed="0.2"
          className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32"
          data-reveal
        >
          <div className="home-glow-ring absolute inset-0 rounded-full bg-brand-amber/30 blur-2xl dark:bg-brand-amber/20" aria-hidden />
          <ScrollLottie
            src={homeLottie.cta}
            triggerRef={scopeRef}
            start="top 90%"
            end="bottom 20%"
            scrub={0.45}
            className="relative h-full w-full"
          />
        </div>
        <h2 className="font-display text-display-clamp mb-4 font-bold" data-reveal>
          {homeFinalCta.headline}
        </h2>
        <p className="mx-auto mb-8 max-w-md opacity-90" data-reveal>
          {homeFinalCta.body}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row" data-reveal>
          <motion.div
            whileHover={reduce ? undefined : { scale: 1.04 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            <Button
              size="lg"
              className="home-cta-pulse min-h-[48px] w-full gap-2 bg-brand-coral text-white shadow-lg shadow-brand-coral/25 hover:bg-brand-coral/90 sm:w-auto"
              onClick={() => openWhatsApp(homeWhatsAppMessages.cta)}
            >
              <MessageCircle className="h-5 w-5" />
              {homeFinalCta.primaryCta}
            </Button>
          </motion.div>
          <motion.div
            whileHover={reduce ? undefined : { scale: 1.02 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            transition={{ ease: easeOutExpo }}
          >
            <Button
              size="lg"
              variant="outline"
              className="min-h-[48px] w-full gap-2 border-[hsl(var(--cta-foreground)/0.35)] bg-transparent text-inherit hover:bg-white/10 hover:text-inherit sm:w-auto"
              asChild
            >
              <Link to="/samples">
                {homeFinalCta.secondaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </ScrollSection>
  );
}
