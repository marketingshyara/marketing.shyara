import { Link } from "react-router-dom";
import { UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TeamRepSummary } from "../../types";

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
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base leading-tight">{name}</CardTitle>
          <p className="truncate text-xs text-muted-foreground">{rep.email}</p>
        </div>
        {rep.needsAdminAction > 0 ? (
          <Badge variant="destructive" className="shrink-0">
            {rep.needsAdminAction} action{rep.needsAdminAction === 1 ? "" : "s"}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <StatChip label="Leads" value={rep.totalLeads} />
          <StatChip label="Clients" value={rep.activeClients} />
          <StatChip label="Ongoing" value={rep.ongoingProjects} />
          <StatChip label="Pending payments" value={pendingPayments} highlight={pendingPayments > 0} />
        </div>
        <Button asChild variant="outline" className="min-h-11 w-full">
          <Link to={`/portal/team/${rep.id}`}>View projects</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function StatChip({
  label,
  value,
  highlight
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <span
      className={
        highlight
          ? "inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 font-medium tabular-nums"
          : "inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 tabular-nums text-muted-foreground"
      }
    >
      <span>{label}</span>
      <span className={highlight ? "text-foreground" : ""}>{value}</span>
    </span>
  );
}
