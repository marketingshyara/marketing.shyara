import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: ReactNode;
  toolbar?: ReactNode;
  className?: string;
};

export function PortalPageHeader({ title, description, toolbar, className }: Props) {
  return (
    <div
      className={
        className ??
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      }
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
        {description ? (
          <div className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</div>
        ) : null}
      </div>
      {toolbar ? <div className="shrink-0">{toolbar}</div> : null}
    </div>
  );
}
