import type { ReactNode } from "react";
import { useRevealAll } from "@/hooks/use-reveal";

export function Page({ children }: { children: ReactNode }) {
  useRevealAll();
  return <main className="pt-20">{children}</main>;
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image: string;
}) {
  return (
    <section className="relative h-[58vh] min-h-[420px] w-full overflow-hidden">
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover ken-burns"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 h-full flex flex-col justify-end pb-16">
        <span className="eyebrow reveal">{eyebrow}</span>
        <h1 className="reveal reveal-delay-1 mt-5 font-display text-5xl sm:text-6xl lg:text-7xl text-balance max-w-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="reveal reveal-delay-2 mt-5 max-w-xl text-base text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
