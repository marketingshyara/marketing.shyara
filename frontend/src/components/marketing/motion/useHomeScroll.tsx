import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useScrollParallax } from "./useScrollParallax";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Scoped GSAP context for the home page — reverts ScrollTriggers on unmount. */
export function useHomeScroll() {
  const rootRef = useRef<HTMLDivElement>(null);

  useScrollParallax(rootRef);

  useGSAP(
    () => {
      ScrollTrigger.refresh();
    },
    { scope: rootRef }
  );

  return rootRef;
}
