import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useRouterState } from "@tanstack/react-router";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}

const VIEWPORT_MARGIN = "-80px";

function useRevealVisible(reduce: boolean) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(reduce);

  useLayoutEffect(() => {
    if (reduce) {
      setVisible(true);
      return;
    }

    setVisible(false);
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const markIfInViewport = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const margin = 80;
      if (rect.top < vh - margin && rect.bottom > 0) {
        setVisible(true);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
        }
      },
      { threshold: 0, rootMargin: VIEWPORT_MARGIN },
    );

    io.observe(el);
    markIfInViewport();
    const raf = requestAnimationFrame(markIfInViewport);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduce, pathname]);

  return { ref, visible };
}

export function Reveal({ children, delay = 0, y = 32, className, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const { ref, visible } = useRevealVisible(reduce);
  const variants: Variants = {
    hidden: { opacity: 1, y: reduce ? 0 : y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };
  const MotionTag = motion[as] as typeof motion.div;

  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <MotionTag
      ref={ref as never}
      className={className}
      initial="hidden"
      animate={visible ? "show" : "hidden"}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}
