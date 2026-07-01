import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  text: string;
  className?: string;
  /** delay before animation begins, in seconds */
  delay?: number;
  /** stagger between words, in seconds */
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

/** Animates text word-by-word with a subtle rise + blur reveal. */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.08,
  as = "h1",
}: SplitTextProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.h1;

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay },
    },
  };

  const word: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : "0.6em", filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <MotionTag
      className={cn(className)}
      variants={container}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.05em] align-bottom">
          <motion.span variants={word} className="inline-block will-change-transform">
            {w}
            {i < text.split(" ").length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}