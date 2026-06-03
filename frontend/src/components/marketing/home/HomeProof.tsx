import { useRef } from "react";

import { Link } from "react-router-dom";

import gsap from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useGSAP } from "@gsap/react";

import { motion, useReducedMotion } from "framer-motion";

import { ArrowRight, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ScrollSection } from "@/components/marketing/motion/ScrollSection";

import { ScrollLottie } from "@/components/marketing/motion/ScrollLottie";

import { MotionReveal } from "@/components/marketing/motion/MotionReveal";

import { StaggerChildren, StaggerItem } from "@/components/marketing/motion/StaggerChildren";

import { HomeAmbientLayer } from "./HomeAmbientLayer";

import { homeLottie } from "@/lib/homeLottie";

import { HomeSectionLabel } from "./HomeSectionLabel";

import { HomeSectionShell } from "./HomeSectionShell";

import { homeProof } from "@/content/home";

import { sampleAssetUrl } from "@/lib/sampleAssetUrl";

import { brandToneClasses } from "@/lib/brandColors";

import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

import { easeOutExpo } from "@/components/marketing/motion/motionPresets";

import { cn } from "@/lib/utils";



gsap.registerPlugin(ScrollTrigger, useGSAP);



export function HomeProof() {

  const scopeRef = useRef<HTMLElement>(null);

  const reduce = useReducedMotion();



  useGSAP(

    () => {

      const scope = scopeRef.current;

      if (!scope || prefersReducedMotion()) return;



      gsap.from(scope.querySelector("[data-proof-lottie-wrap]"), {

        opacity: 0,

        scale: 0.85,

        duration: 0.8,

        ease: "back.out(1.2)",

        scrollTrigger: { trigger: scope, start: "top 78%", once: true },

      });



      gsap.from(scope.querySelectorAll("[data-proof-chip]"), {

        opacity: 0,

        y: 20,

        scale: 0.9,

        duration: 0.55,

        ease: "power3.out",

        stagger: 0.06,

        scrollTrigger: { trigger: scope.querySelector("[data-proof-chips]"), start: "top 88%", once: true },

      });

    },

    { scope: scopeRef }

  );



  return (

    <ScrollSection ref={scopeRef} section="proof">

      <HomeSectionShell tint="trust" className="relative overflow-hidden">

        <HomeAmbientLayer variant="trust" showMesh={false} />

        <div className="relative mb-8 text-center">

          <div

            data-proof-lottie-wrap

            data-parallax

            data-parallax-speed="0.25"

            className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28"

          >

            <div className="home-glow-ring absolute inset-0 rounded-full bg-brand-teal/20 blur-2xl" aria-hidden />

            <ScrollLottie

              src={homeLottie.proof}

              triggerRef={scopeRef}

              start="top 85%"

              end="center 50%"

              scrub={0.5}

              className="relative h-full w-full"

            />

          </div>

          <MotionReveal>

            <HomeSectionLabel>{homeProof.label}</HomeSectionLabel>

          </MotionReveal>

          <MotionReveal delay={0.06}>

            <h2 className="font-display text-hero-clamp font-bold text-foreground">{homeProof.headline}</h2>

          </MotionReveal>

        </div>



        <div data-proof-chips className="relative mb-10 flex flex-wrap justify-center gap-2">

          {homeProof.verticals.map(({ name, tone }) => (

            <span

              key={name}

              data-proof-chip

              className={cn(

                "rounded-full border border-border/50 bg-background/70 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-transform duration-300 hover:-translate-y-0.5",

                brandToneClasses[tone].text

              )}

            >

              {name}

            </span>

          ))}

        </div>



        <StaggerChildren

          as="div"

          className="relative mb-8 grid gap-4 sm:grid-cols-3"

          stagger={0.1}

        >

          {homeProof.samples.map(({ id, name, href, posterUrl }) => (

            <StaggerItem key={id}>

              <motion.a

                href={sampleAssetUrl(href)}

                target="_blank"

                rel="noopener noreferrer"

                data-proof-card

                whileHover={

                  reduce

                    ? undefined

                    : { y: -8, transition: { duration: 0.35, ease: easeOutExpo } }

                }

                className="home-card-lift group block overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm hover:border-brand-emerald/35"

              >

                <div className="aspect-[16/10] overflow-hidden bg-muted">

                  <img

                    src={sampleAssetUrl(posterUrl)}

                    alt={`${name} sample`}

                    className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.06]"

                    loading="lazy"

                  />

                </div>

                <div className="flex items-center justify-between gap-2 p-3">

                  <span className="font-display text-sm font-semibold">{name}</span>

                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />

                </div>

              </motion.a>

            </StaggerItem>

          ))}

        </StaggerChildren>



        <MotionReveal className="relative flex justify-center">

          <Button variant="outline" size="sm" className="min-h-[44px] gap-2" asChild>

            <Link to="/samples">

              {homeProof.cta}

              <ArrowRight className="h-4 w-4" />

            </Link>

          </Button>

        </MotionReveal>

      </HomeSectionShell>

    </ScrollSection>

  );

}

