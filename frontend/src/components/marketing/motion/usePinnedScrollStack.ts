import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface UsePinnedScrollStackOptions {
  stepCount: number;
  onProgress?: (progress: number, activeIndex: number) => void;
}

/**
 * Pins the section: header block stays at top of the pin; cards scrub below.
 * Viewport must have an explicit CSS height (not flex-1 only).
 */
export function usePinnedScrollStack(
  pinRef: RefObject<HTMLElement | null>,
  viewportRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  { stepCount, onProgress }: UsePinnedScrollStackOptions
) {
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const pin = pinRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!pin || !viewport || !track || stepCount < 1) return;

      const panels = track.querySelectorAll<HTMLElement>("[data-stack-panel]");

      const syncPanelHeights = () => {
        const h = viewport.offsetHeight;
        if (h < 80) return false;
        panels.forEach((panel) => {
          panel.style.height = `${h}px`;
          panel.style.minHeight = `${h}px`;
        });
        return true;
      };

      const travelPx = () => {
        if (!syncPanelHeights()) return window.innerHeight * (stepCount - 1);
        return Math.max(1, track.scrollHeight - viewport.offsetHeight);
      };

      const activeIndexForProgress = (progress: number) => {
        if (stepCount <= 1) return 0;
        if (progress >= 1) return stepCount - 1;
        return Math.min(stepCount - 1, Math.floor(progress * stepCount + 1e-5));
      };

      if (prefersReducedMotion()) {
        syncPanelHeights();
        gsap.set(track, { y: 0 });
        gsap.set(progressRef.current, { scaleX: 1 });
        onProgress?.(1, stepCount - 1);
        return;
      }

      gsap.set(track, { y: 0 });
      syncPanelHeights();

      const tween = gsap.to(track, {
        y: () => -travelPx(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${travelPx()}`,
          pin: true,
          pinSpacing: true,
          scrub: true,
          anticipatePin: 0,
          invalidateOnRefresh: true,
          onRefresh: syncPanelHeights,
          onUpdate: (self) => {
            const p = self.progress;
            onProgress?.(p, activeIndexForProgress(p));
            if (progressRef.current) {
              gsap.set(progressRef.current, { scaleX: p });
            }
          },
        },
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("resize", refresh);
      requestAnimationFrame(refresh);

      return () => {
        window.removeEventListener("resize", refresh);
        tween.scrollTrigger?.kill();
        gsap.set(track, { clearProps: "y" });
      };
    },
    { scope: pinRef, dependencies: [stepCount] }
  );

  return progressRef;
}
