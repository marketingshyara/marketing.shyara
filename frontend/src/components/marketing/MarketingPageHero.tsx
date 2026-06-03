import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRevealOnScroll } from "@/components/marketing/motion/useRevealOnScroll";
import { fadeUp, easeOutExpo } from "@/components/marketing/motion/motionPresets";

interface HeroBreadcrumb {
  label: string;
  href?: string;
}

interface MarketingPageHeroProps {
  label: string;
  title: ReactNode;
  description: string;
  breadcrumbs?: HeroBreadcrumb[];
  trustPoints?: string[];
  children?: ReactNode;
}

export function MarketingPageHero({
  label,
  title,
  description,
  breadcrumbs,
  trustPoints,
  children,
}: MarketingPageHeroProps) {
  const scopeRef = useRevealOnScroll({ stagger: 0.12 });
  const reduce = useReducedMotion();

  return (
    <section
      ref={scopeRef}
      className="gradient-hero relative overflow-hidden border-b border-border/60 py-16 md:py-24 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-4 mx-auto h-40 w-[min(90vw,70rem)] rounded-full bg-brand-emerald/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-8 top-24 h-32 w-32 rounded-full bg-brand-sky/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-4 top-16 h-28 w-28 rounded-full bg-brand-amber/15 blur-3xl" />

      <div className="container relative">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-center gap-2 text-small text-muted-foreground"
            data-reveal
          >
            {breadcrumbs.map((crumb, index) => (
              <div key={`${crumb.label}-${index}`} className="inline-flex items-center gap-2">
                {crumb.href ? (
                  <Link to={crumb.href} className="transition-colors hover:text-brand-emerald">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
              </div>
            ))}
          </nav>
        )}

        <div className="mx-auto max-w-4xl text-center">
          <span
            className="section-label inline-flex items-center rounded-full border border-brand-emerald/30 bg-brand-emerald/10 px-4 py-1.5"
            data-reveal
          >
            {label}
          </span>

          <h1
            className="mt-6 text-balance font-display font-extrabold tracking-tight text-foreground text-hero-clamp md:text-5xl"
            data-reveal
          >
            {title}
          </h1>

          <p
            className="mx-auto mt-5 max-w-3xl text-balance text-body leading-relaxed text-muted-foreground md:text-lg"
            data-reveal
          >
            {description}
          </p>

          {trustPoints && trustPoints.length > 0 && (
            <motion.div
              className="mt-8 flex flex-wrap justify-center gap-3"
              initial={reduce ? false : "hidden"}
              animate={reduce ? undefined : "visible"}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07, delayChildren: 0.35 } },
              }}
            >
              {trustPoints.map((point) => (
                <motion.div
                  key={point}
                  variants={fadeUp}
                  transition={{ duration: 0.45, ease: easeOutExpo }}
                  className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-4 py-2.5 text-small text-foreground shadow-card backdrop-blur-sm"
                >
                  <ShieldCheck className="h-4 w-4 flex-shrink-0 text-brand-emerald" />
                  <span>{point}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {children && (
            <div className="mt-8 flex justify-center" data-reveal>
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
