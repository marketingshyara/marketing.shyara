import { type RefObject, useEffect, useState } from "react";

export type UseInViewOptions = {
  rootMargin?: string;
  threshold?: number | number[];
  /** When false, stays false and no observer is attached. */
  enabled?: boolean;
};

const defaultRootMargin = "280px 0px";

/**
 * Tracks whether the element is intersecting the viewport (with optional margin).
 * Updates on enter/leave so callers can mount/unmount heavy content when off-screen.
 */
export function useInView(
  elementRef: RefObject<Element | null>,
  { rootMargin = defaultRootMargin, threshold = 0.01, enabled = true }: UseInViewOptions = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsIntersecting(false);
      return;
    }

    const el = elementRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setIsIntersecting(entries.some((e) => e.isIntersecting));
      },
      { root: null, rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [elementRef, rootMargin, threshold, enabled]);

  return enabled ? isIntersecting : false;
}
