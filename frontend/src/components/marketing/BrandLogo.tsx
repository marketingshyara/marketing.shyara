import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-[1.625rem] md:text-[1.875rem]",
} as const;

type BrandLogoProps = {
  className?: string;
  size?: keyof typeof sizeClasses;
};

export const BrandLogo = forwardRef<HTMLAnchorElement, BrandLogoProps>(function BrandLogo(
  { className, size = "md" },
  ref
) {
  return (
    <Link
      ref={ref}
      to="/"
      className={cn(
        "group inline-flex shrink-0 items-center leading-none transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm",
        className
      )}
      aria-label="Shyara home"
    >
      <span
        className={cn(
          "font-brand tracking-tight text-foreground transition-transform duration-200 group-hover:translate-y-[-0.5px]",
          sizeClasses[size]
        )}
      >
        Shyara
      </span>
    </Link>
  );
});
