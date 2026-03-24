import { cn } from "@/lib/utils";
import { formatPortalLabel, getPortalStatusClass } from "@/components/portal/portal-theme";
import type { ReactNode } from "react";

export function PortalPanel({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("portal-panel", className)}>{children}</section>;
}

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="portal-page-header">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="portal-eyebrow">{eyebrow}</p> : null}
          <h1 className="portal-title mt-2">{title}</h1>
          {description ? <p className="portal-description mt-3">{description}</p> : null}
        </div>
        {action ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
      </div>
    </div>
  );
}

export function PortalSectionHeading({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-small text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
    </div>
  );
}

export function PortalMetricCard({
  label,
  value,
  helper
}: {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
}) {
  return (
    <article className="portal-kpi">
      <p className="portal-eyebrow text-[11px]">{label}</p>
      <p className="mt-4 text-3xl font-bold text-foreground md:text-4xl">{value}</p>
      {helper ? <div className="mt-2 text-small text-muted-foreground">{helper}</div> : null}
    </article>
  );
}

export function PortalStatusBadge({
  status,
  children,
  className
}: {
  status?: string | null;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("portal-badge", getPortalStatusClass(status), className)}>
      {children ?? formatPortalLabel(status ?? "")}
    </span>
  );
}
