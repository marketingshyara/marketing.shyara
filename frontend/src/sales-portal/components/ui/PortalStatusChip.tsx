import type { LucideIcon } from "lucide-react";
import { CheckCircle2, CircleDashed, Clock, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type PortalStatusChipKind = "action" | "waiting" | "complete" | "locked" | "idle";

const KIND_CONFIG: Record<
  PortalStatusChipKind,
  { label: string; Icon: LucideIcon; className: string }
> = {
  action: {
    label: "Action needed",
    Icon: Zap,
    className: "border-primary/40 bg-primary/10 text-primary"
  },
  waiting: {
    label: "Waiting on admin",
    Icon: Clock,
    className: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
  },
  complete: {
    label: "Complete",
    Icon: CheckCircle2,
    className: "border-muted-foreground/30 bg-muted text-muted-foreground"
  },
  locked: {
    label: "Blocked",
    Icon: Lock,
    className: "border-muted-foreground/30 bg-muted text-muted-foreground"
  },
  idle: {
    label: "In progress",
    Icon: CircleDashed,
    className: "border-muted-foreground/30 bg-muted text-muted-foreground"
  }
};

type Props = {
  kind: PortalStatusChipKind;
  label?: string;
  className?: string;
};

export function PortalStatusChip({ kind, label, className }: Props) {
  const config = KIND_CONFIG[kind];
  const Icon = config.Icon;
  const text = label ?? config.label;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
      role="status"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">{text}</span>
    </span>
  );
}

export function badgeVariantToStatusKind(
  variant: "default" | "secondary" | "outline" | "destructive",
  label: string
): PortalStatusChipKind {
  if (variant === "destructive" || label.toLowerCase().includes("approval")) {
    return "action";
  }
  if (variant === "default") return "action";
  if (label.toLowerCase().includes("waiting") || label.toLowerCase().includes("technical")) {
    return "waiting";
  }
  if (label.toLowerCase().includes("complete")) return "complete";
  return "idle";
}
