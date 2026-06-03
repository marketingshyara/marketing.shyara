import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface HomeSectionShellProps {
  children: ReactNode;
  className?: string;
  /** Section atmosphere — warm = human, sky = clarity, mint/trust = growth */
  tint?: "default" | "warm" | "sky" | "mint" | "trust" | "muted";
  narrow?: boolean;
}

const tintClasses = {
  default: "bg-background",
  warm: "surface-warm",
  sky: "surface-sky",
  mint: "surface-mint",
  trust: "surface-trust",
  muted: "surface-warm",
};

export function HomeSectionShell({
  children,
  className,
  tint = "default",
  narrow = true,
}: HomeSectionShellProps) {
  return (
    <div className={cn("py-14 md:py-20", tintClasses[tint], className)}>
      <div className={cn("container", narrow && "max-w-5xl")}>{children}</div>
    </div>
  );
}
