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
      className={cn(
        "flex flex-wrap gap-1 border-2 border-[#0A0A0A] bg-[#FAFAFA] p-1 shadow-[2px_2px_0_0_#0A0A0A]",
        className
      )}
      aria-label="Section"
    >
      {segments.map((seg) => {
        const active = pathname === seg.to || pathname.startsWith(`${seg.to}/`);
        return (
          <Link
            key={seg.to}
            to={seg.to}
            data-state={active ? "active" : "inactive"}
            className={cn(
              "portal-segment inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 px-2 py-2 text-xs font-bold uppercase tracking-wide transition-colors touch-manipulation sm:gap-2 sm:px-3 sm:text-sm",
              active
                ? "border-2 border-[#0A0A0A] bg-[#FF3333] text-white shadow-[2px_2px_0_0_#0A0A0A]"
                : "text-[#0A0A0A]/60 hover:bg-white hover:text-[#0A0A0A]"
            )}
            aria-current={active ? "page" : undefined}
          >
            {seg.label}
            {seg.badge != null && seg.badge > 0 ? (
              <span className="border border-[#0A0A0A] bg-[#0A0A0A] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {seg.badge > 99 ? "99+" : seg.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
