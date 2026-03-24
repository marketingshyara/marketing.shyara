import { portalApi } from "@/lib/portal-api";
import { usePortalSession } from "@/components/portal/PortalGuards";
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
    <div className="space-y-8">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-slate-400">Welcome back</p>
        <h2 className="mt-2 text-3xl font-semibold">{session.data?.user?.name}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          The portal keeps sales, commissions, projects, revisions, duplicate checks, and audit history in one place.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([key, value]) => (
          <article key={key} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{key.replace(/([A-Z])/g, " $1")}</p>
            <p className="mt-4 text-4xl font-semibold text-cyan-300">{value}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Approved Packages</h3>
          <div className="mt-4 space-y-4">
            {support.data?.servicePackages.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.packageName}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.shortPitch}</p>
                  </div>
                  {item.pricing ? <p className="text-sm font-semibold text-emerald-300">Rs. {item.pricing}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Recent Notifications</h3>
          <div className="mt-4 space-y-3">
            {notifications.data?.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-slate-300">{item.message}</p>
                <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {!notifications.data?.length ? <p className="text-sm text-slate-400">No notifications yet.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
