import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getMarketingLenis, isMarketingPath } from "@/lib/marketingLenis";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (isMarketingPath(pathname)) {
      const lenis = getMarketingLenis();
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
        return;
      }
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
