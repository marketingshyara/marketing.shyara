import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer, fadeUp, defaultViewport, easeOutExpo } from "./motionPresets";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StaggerChildrenProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul";
}

export function StaggerChildren({
  children,
  className,
  stagger = 0.08,
  as = "div",
}: StaggerChildrenProps) {
  const reduce = useReducedMotion();
  const Tag = as === "ul" ? motion.ul : motion.div;

  if (reduce) {
    const Plain = as === "ul" ? "ul" : "div";
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
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
