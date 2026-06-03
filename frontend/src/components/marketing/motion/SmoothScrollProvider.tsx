import { useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * Native scroll + ScrollTrigger.update. Lenis is intentionally off on the home
 * page so pin/scrub stacks stay in sync (smooth scroll + pin causes drift).
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    const onScroll = () => ScrollTrigger.update();
    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize, { passive: true });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <>{children}</>;
}
