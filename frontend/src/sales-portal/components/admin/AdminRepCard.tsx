import { Link } from "react-router-dom";
import { UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TeamRepSummary } from "../../types";
import { PortalStatusChip } from "../ui/PortalStatusChip";

type Props = {
  rep: TeamRepSummary;
};

export function AdminRepCard({ rep }: Props) {
  const name = rep.displayName ?? rep.email;
  const pendingPayments = rep.pendingPayments ?? rep.pendingVerifications ?? 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
        <UserCircle className="h-10 w-10 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="text-base leading-tight">{name}</CardTitle>
          <p className="truncate text-xs text-muted-foreground">{rep.email}</p>
          {rep.needsAdminAction > 0 ? (
            <PortalStatusChip
              kind="action"
              label={`${rep.needsAdminAction} need approval`}
              className="mt-1"
            />
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
          <span>{rep.totalLeads} leads</span>
          <span>·</span>
          <span>{rep.activeClients} clients</span>
          <span>·</span>
          <span>{rep.ongoingProjects} ongoing</span>
          {pendingPayments > 0 ? (
            <>
              <span>·</span>
              <span className="font-medium text-foreground">{pendingPayments} payments</span>
            </>
          ) : null}
        </div>
        <Button asChild variant="outline" className="min-h-11 w-full">
          <Link to={`/portal/team/${rep.id}`}>View projects</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
