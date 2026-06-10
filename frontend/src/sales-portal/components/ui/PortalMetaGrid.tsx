import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PortalMetaItem = {
  label: string;
  value: ReactNode;
};

type Props = {
  items: PortalMetaItem[];
  className?: string;
};

export function PortalMetaGrid({ items, className }: Props) {
  if (items.length === 0) return null;

  return (
    <dl
      className={cn(
        "space-y-0 border-2 border-[#0A0A0A] bg-white text-sm shadow-[2px_2px_0_0_#0A0A0A]",
        className
      )}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            "grid grid-cols-[minmax(5rem,auto)_1fr] gap-x-4 gap-y-0.5 px-3 py-2",
            i > 0 && "border-t-2 border-[#0A0A0A]/10"
          )}
        >
          <dt className="text-xs font-bold uppercase tracking-wide text-[#0A0A0A]/50">
            {item.label}
          </dt>
          <dd className="min-w-0 font-medium break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
