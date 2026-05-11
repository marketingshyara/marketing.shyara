import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { QueryErrorAlert } from "../components/QueryErrorAlert";
import { DataStaleToolbar } from "../components/DataStaleToolbar";
import { useTeamRepQuery } from "../hooks/useSalesQueries";
import { leadStatusLabel } from "../lib/copy";
import { formatMinorUnits } from "../lib/money";

export function Rep360Page() {
  const { userId } = useParams<{ userId: string }>();
  const qr = useTeamRepQuery(userId, !!userId);

  if (!userId) {
    return <p className="text-destructive">Missing rep.</p>;
  }

  if (qr.isError) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <QueryErrorAlert message="Could not load this rep." onRetry={() => void qr.refetch()} />
        <Button asChild variant="link" className="min-h-11">
          <Link to="/portal/team">Back to team</Link>
        </Button>
      </div>
    );
  }

  if (qr.isLoading || !qr.data) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const { rep, recentLeads } = qr.data;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button asChild variant="ghost" className="min-h-11 -ml-2 w-fit px-2">
            <Link to="/portal/team">← Team</Link>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {rep.displayName ?? rep.email}
          </h1>
          <p className="text-sm text-muted-foreground">{rep.email}</p>
        </div>
        <DataStaleToolbar
          dataUpdatedAt={qr.dataUpdatedAt}
          onRefresh={() => void qr.refetch()}
          isFetching={qr.isFetching}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Active leads</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{rep.activeLeads}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending verifications
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {rep.pendingVerifications}
          </CardContent>
        </Card>
        <Card className="sm:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild variant="outline" className="min-h-11 w-full">
              <Link to={`/portal/leads?rep=${encodeURIComponent(rep.id)}`}>Leads for this rep</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11 w-full">
              <Link to="/portal/approvals">Payment reviews</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent leads</CardTitle>
        </CardHeader>
        <CardContent className="px-1">
          <div className="overflow-x-auto rounded-md px-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Agreed total</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.clientName}</TableCell>
                    <TableCell>{leadStatusLabel(l.status)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {l.agreedTotalCents != null ? formatMinorUnits(l.agreedTotalCents) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="link" className="h-auto min-h-11 px-2">
                        <Link to={`/portal/leads/${l.id}`}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
