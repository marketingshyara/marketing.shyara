import { useEffect, useRef, useState, type ReactNode } from "react";
import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";

interface LottieIconProps {
  src: string;
  className?: string;
  fallback?: ReactNode;
  ariaHidden?: boolean;
}

export function LottieIcon({ src, className, fallback, ariaHidden = true }: LottieIconProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "80px", threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    let cancelled = false;
    fetch(src)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setAnimationData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [inView, src]);

  if (prefersReducedMotion() && fallback) {
    return (
      <div className={cn("flex items-center justify-center", className)} aria-hidden={ariaHidden}>
        {fallback}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("flex items-center justify-center", className)} aria-hidden={ariaHidden}>
      {animationData ? (
        <Lottie animationData={animationData} loop className="h-full w-full" />
      ) : (
        fallback ?? <div className="h-full w-full rounded-full bg-brand-emerald/10 animate-pulse" />
      )}
    </div>
  );
}
