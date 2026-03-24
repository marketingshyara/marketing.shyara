import {
  PortalPageHeader,
  PortalPanel,
  PortalSectionHeading
} from "@/components/portal/portal-ui";
import { formatPortalDateTime, formatPortalLabel } from "@/components/portal/portal-theme";
import { portalApi } from "@/lib/portal-api";
import { useQuery } from "@tanstack/react-query";

export default function PortalAuditPage() {
  const audit = useQuery({ queryKey: ["portal-audit"], queryFn: portalApi.audit });

  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Audit Trail"
        title="Review admin actions with clearer event visibility"
        description="The audit trail now uses readable cards and stronger contrast so action history is easier to scan across desktop and mobile."
      />

      <PortalPanel>
        <PortalSectionHeading
          title="Admin Audit Trail"
          description="Every major admin action is recorded with entity context and timestamps."
        />
        <div className="portal-card-list mt-5">
          {audit.data?.map((entry) => (
            <div key={entry.id} className="portal-list-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-semibold text-foreground">{formatPortalLabel(entry.action)}</p>
                <span className="text-caption text-muted-foreground">{formatPortalDateTime(entry.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {entry.entityType} - {entry.entityId}
              </p>
              {entry.details ? <p className="mt-3 text-sm leading-relaxed text-foreground">{entry.details}</p> : null}
            </div>
          ))}
          {!audit.data?.length ? <p className="text-sm text-muted-foreground">No audit events recorded yet.</p> : null}
        </div>
      </PortalPanel>
    </div>
  );
}
