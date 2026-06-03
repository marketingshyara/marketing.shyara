import { cn } from "@/lib/utils";

interface HomeSectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function HomeSectionLabel({ children, className }: HomeSectionLabelProps) {
  return (
    <p
      className={cn(
        "section-label mb-3 tracking-[0.2em]",
        className
      )}
      data-reveal
    >
      {children}
    </p>
  );
}
