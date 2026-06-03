import { type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scrubs vertical parallax on elements with `data-parallax` and optional `data-parallax-speed` (default 0.35).
 */
export function useScrollParallax(scopeRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope || prefersReducedMotion()) return;

      const targets = scope.querySelectorAll<HTMLElement>("[data-parallax]");
      targets.forEach((el) => {
        const speed = Number(el.dataset.parallaxSpeed ?? "0.35");
        const trigger = el.closest("[data-section]") ?? scope;

        gsap.fromTo(
          el,
          { y: -speed * 40 },
          {
            y: speed * 40,
            ease: "none",
            scrollTrigger: {
              trigger,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      });
    },
    { scope: scopeRef, dependencies: [] }
  );
}
