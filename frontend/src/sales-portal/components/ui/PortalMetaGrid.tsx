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
        "space-y-2 rounded-md border bg-muted/30 px-3 py-3 text-sm",
        className
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="grid grid-cols-[minmax(5rem,auto)_1fr] gap-x-4 gap-y-0.5"
        >
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 font-medium break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
