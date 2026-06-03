import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { fadeUp, defaultViewport, easeOutExpo } from "./motionPresets";
import { cn } from "@/lib/utils";

interface MotionRevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  direction?: "up" | "none";
}

export function MotionReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  ...rest
}: MotionRevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  const variants =
    direction === "up"
      ? fadeUp
      : { hidden: { opacity: 0 }, visible: { opacity: 1 } };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={variants}
      transition={{ duration: 0.55, delay, ease: easeOutExpo }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
