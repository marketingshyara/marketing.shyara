import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export type PortalSegment = {
  to: string;
  label: string;
  badge?: number;
};

type Props = {
  segments: PortalSegment[];
  className?: string;
};

export function PortalSegmentedNav({ segments, className }: Props) {
  const { pathname } = useLocation();

  return (
    <nav
      className={cn("flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-1", className)}
      aria-label="Section"
    >
      {segments.map((seg) => {
        const active = pathname === seg.to || pathname.startsWith(`${seg.to}/`);
        return (
          <Link
            key={seg.to}
            to={seg.to}
            className={cn(
              "inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors touch-manipulation sm:gap-2 sm:px-3 sm:text-sm",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            {seg.label}
            {seg.badge != null && seg.badge > 0 ? (
              <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
                {seg.badge > 99 ? "99+" : seg.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
