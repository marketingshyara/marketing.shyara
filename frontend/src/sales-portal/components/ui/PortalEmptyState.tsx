import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function PortalEmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#0A0A0A]/30 bg-white px-6 py-10 text-center shadow-[4px_4px_0_0_#0A0A0A]",
        className
      )}
    >
      <span className="font-logo text-3xl text-[#FF3333]" aria-hidden>
        ✱
      </span>
      <Icon className="h-8 w-8 text-[#0A0A0A]/40" aria-hidden />
      <div className="space-y-1">
        <p className="font-heading text-lg font-black uppercase tracking-tight">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-[#0A0A0A]/60">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
