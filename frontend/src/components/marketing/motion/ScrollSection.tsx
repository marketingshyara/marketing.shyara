import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ScrollSectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Passed to GSAP / analytics as data-section */
  section?: string;
  pin?: boolean;
  as?: "section" | "div";
}

export const ScrollSection = forwardRef<HTMLElement, ScrollSectionProps>(
  ({ id, children, className, section, pin = false, as = "section" }, ref) => {
    const Tag = as;
    return (
      <Tag
        ref={ref as never}
        id={id}
        data-section={section}
        data-pin={pin ? "true" : undefined}
        className={cn("relative", className)}
      >
        {children}
      </Tag>
    );
  }
);

ScrollSection.displayName = "ScrollSection";
