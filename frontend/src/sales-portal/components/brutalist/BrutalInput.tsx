import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const BrutalInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("portal-brutal-input", className)} {...props} />
));
BrutalInput.displayName = "BrutalInput";
