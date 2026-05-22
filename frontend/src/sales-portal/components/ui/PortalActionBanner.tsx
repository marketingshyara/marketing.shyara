import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        "flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        variant === "urgent"
          ? "border-destructive/40 bg-destructive/5"
          : "border-primary/30 bg-primary/5",
        className
      )}
      role="status"
    >
      <p className="text-sm font-medium">{message}</p>
      <Button asChild size="sm" className="min-h-11 shrink-0 touch-manipulation">
        <Link to={actionTo}>
          {actionLabel}
          <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
