import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, fadeUp, easeOutExpo } from "./motionPresets";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Matches motionPresets defaultViewport margin (-8% vertical). */
const STAGGER_VIEWPORT_MARGIN = "-8% 0px";

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul";
  /** When this changes, replay the reveal (e.g. async list or filter). */
  revealKey?: string | number;
}

function useStaggerReveal(enabled: boolean, revealKey?: string | number) {
  const ref = useRef<HTMLDivElement | HTMLUListElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return;
    }

    setVisible(false);
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const markVisibleIfInViewport = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const margin = vh * 0.08;
      if (rect.top < vh - margin && rect.bottom > margin) {
        setVisible(true);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
        }
      },
      { rootMargin: STAGGER_VIEWPORT_MARGIN, threshold: 0 }
    );

    observer.observe(el);
    const raf = requestAnimationFrame(markVisibleIfInViewport);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [enabled, revealKey]);

  return { ref, visible };
}

export function StaggerChildren({
  children,
  className,
  stagger = 0.08,
  as = "div",
  revealKey,
}: StaggerChildrenProps) {
  const reduce = useReducedMotion();
  const Tag = as === "ul" ? motion.ul : motion.div;
  const { ref, visible } = useStaggerReveal(!reduce, revealKey);

  if (reduce) {
    const Plain = as === "ul" ? "ul" : "div";
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      ref={ref}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      variants={staggerContainer(stagger)}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.5, ease: easeOutExpo }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
