import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: ReactNode;
  toolbar?: ReactNode;
  className?: string;
  /** operational = compact (description hidden unless passed); config = allows helper text */
  variant?: "operational" | "config";
  badge?: ReactNode;
  stat?: ReactNode;
};

export function PortalPageHeader({
  title,
  description,
  toolbar,
  className,
  variant = "config",
  badge,
  stat
}: Props) {
  const showDescription = description != null && variant === "config";

  return (
    <div
      className={
        className ??
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      }
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
          {badge ? <div className="shrink-0">{badge}</div> : null}
          {stat ? (
            <Badge variant="secondary" className="font-normal">
              {stat}
            </Badge>
          ) : null}
        </div>
        {showDescription ? (
          <div className="text-sm text-muted-foreground">{description}</div>
        ) : null}
      </div>
      {toolbar ? <div className={cn("shrink-0")}>{toolbar}</div> : null}
    </div>
  );
}
