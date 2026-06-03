import * as React from "react";

export const MOBILE_BREAKPOINT = 768;

const mobileQuery = () =>
  typeof window !== "undefined" && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(mobileQuery);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

/**
 * Website samples grid uses poster thumbnails (reliable in dev + production).
 * Live preview opens in a dialog on tap; avoids SPA fallback breaking iframe previews.
 */
export function usePreferPosterGrid(): boolean {
  return true;
}
