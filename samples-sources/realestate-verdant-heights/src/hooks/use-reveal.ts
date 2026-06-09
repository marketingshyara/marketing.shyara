import { useEffect } from "react";

/**
 * Adds `.is-visible` to every `.reveal` element as it scrolls into view.
 * One global IntersectionObserver per mount.
 */
export function useReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}
