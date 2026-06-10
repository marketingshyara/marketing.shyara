import type Lenis from "lenis";

let marketingLenis: Lenis | null = null;

export function registerMarketingLenis(lenis: Lenis | null) {
  marketingLenis = lenis;
}

export function getMarketingLenis() {
  return marketingLenis;
}

export function isMarketingPath(pathname: string) {
  return !pathname.startsWith("/portal");
}
