import { cn } from "@/lib/utils";

type Variant = "hero" | "warm" | "sky" | "trust" | "cta";

const variantOrbs: Record<Variant, { className: string; delay?: string }[]> = {
  hero: [
    { className: "left-[8%] top-[18%] h-2 w-2 bg-brand-emerald/50" },
    { className: "right-[12%] top-[32%] h-1.5 w-1.5 bg-brand-sky/60", delay: "animation-delay-700" },
    { className: "left-[22%] bottom-[28%] h-1 w-1 bg-brand-violet/50", delay: "animation-delay-1000" },
    { className: "right-[28%] bottom-[22%] h-2.5 w-2.5 bg-brand-amber/40", delay: "animation-delay-300" },
  ],
  warm: [
    { className: "left-[6%] top-[20%] h-1.5 w-1.5 bg-brand-amber/45" },
    { className: "right-[10%] top-[40%] h-2 w-2 bg-brand-emerald/35", delay: "animation-delay-500" },
  ],
  sky: [
    { className: "left-[14%] top-[12%] h-2 w-2 bg-brand-sky/50" },
    { className: "right-[8%] bottom-[30%] h-1.5 w-1.5 bg-brand-emerald/40", delay: "animation-delay-800" },
  ],
  trust: [
    { className: "left-[10%] bottom-[25%] h-2 w-2 bg-brand-emerald/45" },
    { className: "right-[14%] top-[15%] h-1 w-1 bg-brand-teal/55", delay: "animation-delay-600" },
  ],
  cta: [
    { className: "left-[18%] top-[25%] h-2 w-2 bg-brand-amber/55" },
    { className: "right-[20%] bottom-[30%] h-1.5 w-1.5 bg-white/30", delay: "animation-delay-400" },
  ],
};

interface HomeAmbientLayerProps {
  variant?: Variant;
  className?: string;
  showMesh?: boolean;
}

/** Lightweight floating dots + optional mesh — CSS only, no extra JS */
export function HomeAmbientLayer({ variant = "hero", className, showMesh = true }: HomeAmbientLayerProps) {
  const orbs = variantOrbs[variant];

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {showMesh && <div className="home-mesh absolute inset-0 opacity-60 dark:opacity-40" />}
      {orbs.map((orb, i) => (
        <span
          key={i}
          className={cn(
            "home-float-dot absolute rounded-full blur-[0.5px]",
            orb.className,
            orb.delay
          )}
        />
      ))}
    </div>
  );
}
