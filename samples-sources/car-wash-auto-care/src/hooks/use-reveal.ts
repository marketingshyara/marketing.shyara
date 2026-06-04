import { useLayoutEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const REVEAL_SELECTOR = ".reveal:not(.in-view), .reveal-scale:not(.in-view)";

/** Mirrors IntersectionObserver rootMargin bottom inset (50px). */
const VIEWPORT_BOTTOM_INSET = 50;

function isInRevealViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh - VIEWPORT_BOTTOM_INSET && rect.bottom > 0;
}

function markVisible(el: Element, observer: IntersectionObserver) {
  el.classList.add("in-view");
  observer.unobserve(el);
}

export function useReveal() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useLayoutEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            markVisible(entry.target, io);
          }
        }
      },
      { threshold: 0.12, rootMargin: `0px 0px -${VIEWPORT_BOTTOM_INSET}px 0px` },
    );

    els.forEach((el) => {
      if (isInRevealViewport(el)) {
        markVisible(el, io);
      } else {
        io.observe(el);
      }
    });

    const raf = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((el) => {
        if (isInRevealViewport(el)) markVisible(el, io);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [pathname]);
}
