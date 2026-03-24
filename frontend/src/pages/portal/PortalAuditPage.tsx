import { portalApi } from "@/lib/portal-api";
import { useQuery } from "@tanstack/react-query";

export default function PortalAuditPage() {
  const audit = useQuery({ queryKey: ["portal-audit"], queryFn: portalApi.audit });

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold">Admin Audit Trail</h2>
      <div className="mt-6 space-y-3">
        {audit.data?.map((entry) => (
          <div key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="font-medium">{entry.action.replaceAll("_", " ")}</p>
            <p className="mt-1 text-sm text-slate-400">
              {entry.entityType} · {entry.entityId}
            </p>
            {entry.details ? <p className="mt-2 text-sm text-slate-300">{entry.details}</p> : null}
            <p className="mt-2 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
