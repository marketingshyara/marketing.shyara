import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { sampleAssetUrl } from "@/lib/sampleAssetUrl";
import { useWebsiteManifest } from "@/hooks/useWebsiteManifest";
import type { WebsiteSample } from "@/types/samples";

const SLIDE_INTERVAL_MS = 3000;
const SLIDE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FALLBACK_POSTER = sampleAssetUrl(
  "/samples/websites/restaurant-classic-website/poster.jpg"
);

function slidesFromSamples(samples: WebsiteSample[]) {
  return samples
    .filter((s) => s.posterUrl?.trim())
    .map((s) => ({
      id: s.id,
      name: s.name,
      src: sampleAssetUrl(s.posterUrl!.trim()),
      alt: `${s.name} — website hero preview`,
    }));
}

type Props = {
  className?: string;
};

export function HeroSampleCarousel({ className }: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const { samples, loading } = useWebsiteManifest();
  const slides = useMemo(() => slidesFromSamples(samples), [samples]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (reduceMotion || slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [reduceMotion, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const next = slides[(index + 1) % slides.length];
    const img = new Image();
    img.src = next.src;
  }, [index, slides]);

  const active = slides[index];
  const showFallback = !loading && slides.length === 0;

  return (
    <div
      data-testid="hero-sample-carousel"
      className={cn("relative h-[340px] w-full overflow-hidden bg-[#F5F5F5]", className)}
      aria-hidden
    >
      {loading && slides.length === 0 ? (
        <div className="absolute inset-0 animate-pulse bg-[#EBEBEB]" />
      ) : showFallback ? (
        <img
          src={FALLBACK_POSTER}
          alt="Website design preview"
          className="h-full w-full object-cover object-top"
        />
      ) : active ? (
        reduceMotion ? (
          <img
            key={active.id}
            src={active.src}
            alt={active.alt}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img
              key={active.id}
              src={active.src}
              alt={active.alt}
              className="absolute inset-0 h-full w-full object-cover object-top"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.55, ease: SLIDE_EASE }}
            />
          </AnimatePresence>
        )
      ) : null}
    </div>
  );
}
