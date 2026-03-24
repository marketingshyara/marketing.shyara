import { usePortalSession } from "@/components/portal/PortalGuards";
import {
  PortalMetricCard,
  PortalPageHeader,
  PortalPanel,
  PortalSectionHeading
} from "@/components/portal/portal-ui";
import { formatPortalCurrency, formatPortalDateTime, formatPortalLabel } from "@/components/portal/portal-theme";
import { portalApi } from "@/lib/portal-api";
import { useQuery } from "@tanstack/react-query";

export default function PortalDashboardPage() {
  const session = usePortalSession();
  const dashboard = useQuery({ queryKey: ["portal-dashboard"], queryFn: portalApi.dashboard });
  const support = useQuery({ queryKey: ["portal-support"], queryFn: portalApi.supportContent });
  const notifications = useQuery({ queryKey: ["portal-notifications"], queryFn: portalApi.notifications });

  const cards = dashboard.data
    ? Object.entries(dashboard.data).filter(([, value]) => typeof value === "number")
    : [];

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Overview"
        title={`Welcome back, ${session.data?.user?.name ?? "team"}`}
        description="The portal keeps sales, commissions, projects, revisions, duplicate checks, and audit history in one place with the same clean visual language as the main Shyara site."
      />

      <section className="portal-stat-grid">
        {cards.map(([key, value]) => (
          <PortalMetricCard
            key={key}
            label={formatPortalLabel(key)}
            value={typeof value === "number" && key.toLowerCase().includes("value") ? formatPortalCurrency(value) : value}
            helper="Live operational count"
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <PortalPanel>
          <PortalSectionHeading
            title="Approved Packages"
            description="Reference pricing and positioning approved for the sales team."
          />
          <div className="portal-card-list mt-5">
            {support.data?.servicePackages.map((item) => (
              <div key={item.id} className="portal-list-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{item.packageName}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.shortPitch}</p>
                    {item.inclusions.length ? (
                      <p className="mt-3 text-caption text-muted-foreground">
                        Includes: {item.inclusions.join(", ")}
                      </p>
                    ) : null}
                  </div>
                  {item.pricing ? (
                    <div className="shrink-0 rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
                      {formatPortalCurrency(item.pricing)}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {!support.data?.servicePackages.length ? (
              <p className="text-sm text-muted-foreground">No packages configured yet.</p>
            ) : null}
          </div>
        </PortalPanel>

        <PortalPanel className="bg-[hsl(var(--surface))]">
          <PortalSectionHeading
            title="Recent Notifications"
            description="A quick snapshot of the latest operational movement."
          />
          <div className="portal-card-list mt-5">
            {notifications.data?.map((item) => (
              <div key={item.id} className="portal-list-card">
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.message}</p>
                <p className="mt-3 text-caption text-muted-foreground">{formatPortalDateTime(item.createdAt)}</p>
              </div>
            ))}
            {!notifications.data?.length ? (
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            ) : null}
          </div>
        </PortalPanel>
      </section>
    </div>
  );
}
