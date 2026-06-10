import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrutalButton } from "../brutalist";
import { PORTAL_ACTION_BANNER } from "../../theme/statusColors";

type Props = {
  message: ReactNode;
  actionLabel: string;
  actionTo: string;
  variant?: "default" | "urgent";
  className?: string;
};

export function PortalActionBanner({
  message,
  actionLabel,
  actionTo,
  variant = "default",
  className
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-4 py-3 shadow-[2px_2px_0_0_#0A0A0A] sm:flex-row sm:items-center sm:justify-between",
        variant === "urgent"
          ? "border-2 border-[#0A0A0A] border-l-[4px] border-l-[#FF3333] bg-white"
          : PORTAL_ACTION_BANNER,
        className
      )}
      role="status"
    >
      <p className="text-sm font-bold">{message}</p>
      <BrutalButton asChild className="shrink-0 touch-manipulation text-xs">
        <Link to={actionTo}>
          {actionLabel}
          <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
        </Link>
      </BrutalButton>
    </div>
  );
}
