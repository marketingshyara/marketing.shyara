import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { registerMarketingLenis } from "@/lib/marketingLenis";

type Props = {
  children: ReactNode;
};

/**
 * Smooth wheel/touch scrolling for the marketing site via Lenis.
 * Skipped when the user prefers reduced motion (native scroll stays instant).
 */
export function MarketingSmoothScroll({ children }: Props) {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const start = () => {
      if (reducedMotion.matches) return null;

      const lenis = new Lenis({
        autoRaf: true,
        duration: 1.05,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.25,
      });

      registerMarketingLenis(lenis);
      return lenis;
    };

    let lenis = start();

    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches && lenis) {
        lenis.destroy();
        registerMarketingLenis(null);
        lenis = null;
        return;
      }
      if (!reducedMotion.matches && !lenis) {
        lenis = start();
      }
    };

    reducedMotion.addEventListener("change", onMotionPreferenceChange);

    return () => {
      reducedMotion.removeEventListener("change", onMotionPreferenceChange);
      lenis?.destroy();
      registerMarketingLenis(null);
    };
  }, []);

  return <>{children}</>;
}
