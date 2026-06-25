import { type CSSProperties, type ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article" | "header" | "footer";
};

export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: Props) {
  const ref = useReveal<HTMLDivElement>();
  const style: CSSProperties = delay ? { transitionDelay: `${delay}ms` } : {};
  return (
    <Tag ref={ref as never} className={`reveal ${className}`} style={style}>
      {children}
    </Tag>
  );
}