import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type RevealDirection = "up" | "left" | "right";

interface UseRevealOnScrollOptions {
  selector?: string;
  direction?: RevealDirection;
  stagger?: number;
  start?: string;
  batch?: boolean;
}

export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOnScrollOptions = {}
) {
  const {
    selector = "[data-reveal]",
    direction = "up",
    stagger = 0.1,
    start = "top 85%",
    batch = false,
  } = options;

  const scopeRef = useRef<T>(null);

  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope) return;

      const fromVars: gsap.TweenVars = { opacity: 0, duration: 0.7, ease: "power3.out" };
      if (direction === "up") fromVars.y = 48;
      if (direction === "left") fromVars.x = -40;
      if (direction === "right") fromVars.x = 40;

      if (prefersReducedMotion()) {
        gsap.set(scope.querySelectorAll(selector), { opacity: 1, x: 0, y: 0 });
        return;
      }

      if (batch) {
        ScrollTrigger.batch(scope.querySelectorAll(selector), {
          start,
          onEnter: (elements) => {
            gsap.from(elements, { ...fromVars, stagger });
          },
          once: true,
        });
        return;
      }

      gsap.from(scope.querySelectorAll(selector), {
        ...fromVars,
        stagger,
        scrollTrigger: {
          trigger: scope,
          start,
          once: true,
        },
      });
    },
    { scope: scopeRef }
  );

  return scopeRef;
}
