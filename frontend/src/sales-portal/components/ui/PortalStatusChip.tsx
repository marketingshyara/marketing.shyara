import type { LucideIcon } from "lucide-react";
import { CheckCircle2, CircleDashed, Clock, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { PORTAL_STATUS_STYLES } from "../../theme/statusColors";

export type PortalStatusChipKind = "action" | "waiting" | "complete" | "locked" | "idle";

const KIND_CONFIG: Record<
  PortalStatusChipKind,
  { label: string; Icon: LucideIcon }
> = {
  action: { label: "Action needed", Icon: Zap },
  waiting: { label: "Waiting on admin", Icon: Clock },
  complete: { label: "Complete", Icon: CheckCircle2 },
  locked: { label: "Blocked", Icon: Lock },
  idle: { label: "In progress", Icon: CircleDashed },
};

type Props = {
  kind: PortalStatusChipKind;
  label?: string;
  className?: string;
};

export function PortalStatusChip({ kind, label, className }: Props) {
  const config = KIND_CONFIG[kind];
  const styles = PORTAL_STATUS_STYLES[kind];
  const Icon = config.Icon;
  const text = label ?? config.label;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
        styles.chip,
        className
      )}
      role="status"
    >
      <Icon className={cn("h-3.5 w-3.5 shrink-0", styles.icon)} aria-hidden />
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
