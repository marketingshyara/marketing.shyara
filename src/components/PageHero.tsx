import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck } from "lucide-react";

interface HeroBreadcrumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  label: string;
  title: ReactNode;
  description: string;
  breadcrumbs?: HeroBreadcrumb[];
  trustPoints?: string[];
  children?: ReactNode;
}

export function PageHero({
  label,
  title,
  description,
  breadcrumbs,
  trustPoints,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-background via-background to-[hsl(var(--surface))] py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-4 mx-auto h-40 w-[min(90vw,70rem)] rounded-full bg-accent/15 blur-3xl" />
      <div className="container relative">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <div key={`${crumb.label}-${index}`} className="inline-flex items-center gap-2">
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-accent transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
              </div>
            ))}
          </nav>
        )}

        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {label}
          </span>

          <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>

          {trustPoints && trustPoints.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-4 py-2 text-sm text-foreground shadow-sm"
                >
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          )}

          {children && <div className="mt-8 flex justify-center">{children}</div>}
        </div>
      </div>
    </section>
  );
}
