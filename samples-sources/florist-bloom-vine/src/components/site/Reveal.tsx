import type { ElementType, ReactNode, CSSProperties } from "react";
import { useReveal } from "@/hooks/use-reveal";

interface RevealProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "fade" | "image";
}

export function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  variant = "fade",
}: RevealProps) {
  const ref = useReveal<HTMLElement>();
  const base = variant === "image" ? "reveal-img" : "reveal";
  const style: CSSProperties | undefined =
    delay > 0 ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <Tag ref={ref as never} className={`${base} ${className}`} style={style}>
      {children}
    </Tag>
  );
}
