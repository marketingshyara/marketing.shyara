import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { sampleAssetUrl } from "@/lib/sampleAssetUrl";
import {
  SAMPLE_POSTER_ASPECT_RATIO,
  websiteSamplesWithPosters,
} from "@/lib/websiteSamplesManifest";

const SLIDE_INTERVAL_MS = 3000;
const SLIDE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const FALLBACK_POSTER = sampleAssetUrl(
  "/samples/websites/restaurant-classic-website/poster.jpg"
);

const frameClass =
  "relative w-full overflow-hidden bg-[#F5F5F5]";

type Props = {
  className?: string;
};

function PosterFrame({
  src,
  alt,
  loading,
}: {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
}) {
  return (
    <img
      src={src}
      alt={alt}
      className="block h-full w-full object-contain object-top"
      loading={loading}
      decoding="async"
      draggable={false}
    />
  );
}

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

  const frameStyle = { aspectRatio: String(SAMPLE_POSTER_ASPECT_RATIO) };

  if (slides.length === 0) {
    return (
      <div
        data-testid="hero-sample-carousel"
        className={cn(frameClass, className)}
        style={frameStyle}
        aria-hidden
      >
        <PosterFrame src={FALLBACK_POSTER} alt="Website design preview" loading="eager" />
      </div>
    );
  }

  if (slides.length === 1) {
    const slide = slides[0];
    return (
      <div
        data-testid="hero-sample-carousel"
        className={cn(frameClass, className)}
        style={frameStyle}
        aria-hidden
      >
        <PosterFrame src={slide.src} alt={slide.alt} loading="eager" />
      </div>
    );
  }

  return (
    <div
      data-testid="hero-sample-carousel"
      className={cn(frameClass, className)}
      style={frameStyle}
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
          <div
            key={slide.id}
            className="h-full shrink-0"
            style={{ width: `${100 / slides.length}%` }}
          >
            <PosterFrame
              src={slide.src}
              alt={slide.alt}
              loading={slideIndex === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
