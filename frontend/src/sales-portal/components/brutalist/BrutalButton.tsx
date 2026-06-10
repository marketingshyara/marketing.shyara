import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "destructive" | "ghost";

const variantClass: Record<Variant, string> = {
  primary: "portal-brutal-btn-primary",
  secondary: "portal-brutal-btn-secondary",
  destructive:
    "inline-flex min-h-11 items-center justify-center gap-2 border-2 border-[#0A0A0A] bg-[#0A0A0A] px-6 font-bold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#FF3333] disabled:pointer-events-none disabled:opacity-50",
  ghost:
    "inline-flex min-h-11 items-center justify-center gap-2 px-4 font-bold uppercase tracking-wide text-[#0A0A0A] underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50",
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  asChild?: boolean;
};

export const BrutalButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(variantClass[variant], className)}
        {...props}
      />
    );
  }
);
BrutalButton.displayName = "BrutalButton";
