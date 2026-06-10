import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { sampleAssetUrl } from "@/lib/sampleAssetUrl";
import { websiteSamplesWithPosters } from "@/lib/websiteSamplesManifest";

const SLIDE_INTERVAL_MS = 3000;
const SLIDE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const FALLBACK_POSTER = sampleAssetUrl(
  "/samples/websites/restaurant-classic-website/poster.jpg"
);

type Props = {
  className?: string;
};

export function HeroSampleCarousel({ className }: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const slides = useMemo(() => websiteSamplesWithPosters(), []);
  const [index, setIndex] = useState(0);

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

  if (slides.length === 0) {
    return (
      <div
        data-testid="hero-sample-carousel"
        className={cn("relative h-[340px] w-full overflow-hidden bg-[#F5F5F5]", className)}
        aria-hidden
      >
        <img
          src={FALLBACK_POSTER}
          alt="Website design preview"
          className="h-full w-full object-cover object-top"
        />
      </div>
    );
  }

  return (
    <div
      data-testid="hero-sample-carousel"
      className={cn("relative h-[340px] w-full overflow-hidden bg-[#F5F5F5]", className)}
      aria-hidden
    >
      <div
        className="flex h-full will-change-transform"
        style={{
          width: `${slides.length * 100}%`,
          transform: `translateX(-${(index * 100) / slides.length}%)`,
          transition: reduceMotion ? "none" : `transform 0.55s ${SLIDE_EASE}`,
        }}
      >
        {slides.map((slide, slideIndex) => (
          <img
            key={slide.id}
            src={slide.src}
            alt={slide.alt}
            className="h-full flex-shrink-0 object-cover object-top"
            style={{ width: `${100 / slides.length}%`, minWidth: `${100 / slides.length}%` }}
            loading={slideIndex === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}
