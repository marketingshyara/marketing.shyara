import { type RefObject, useEffect, useState } from "react";

const defaultRootMargin = "280px 0px";

/**
 * Fires once when the element intersects the viewport (with margin). SSR-safe: stays false.
 * Disconnects after first hit to avoid observer overhead.
 */
export function useInViewOnce(
  elementRef: RefObject<Element | null>,
  rootMargin: string = defaultRootMargin
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = elementRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit) {
          setInView(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [elementRef, inView, rootMargin]);

  return inView;
}
