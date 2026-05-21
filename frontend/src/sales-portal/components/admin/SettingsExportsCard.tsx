import { Download } from "lucide-react";
import { useAdminSettingsQuery, useExportMutation } from "../../hooks/useSalesQueries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const EXPORT_KINDS = [
  { kind: "leads" as const, label: "Leads", description: "All leads with status and assignee" },
  { kind: "commissions" as const, label: "Commissions", description: "Commission rows and payout status" },
  { kind: "users" as const, label: "Users", description: "Portal users and roles" }
];

export function SettingsExportsCard() {
  const exportMut = useExportMutation();
  const settingsQr = useAdminSettingsQuery(true);
  const maxRows = settingsQr.data?.settings.exportMaxRows;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Data exports</CardTitle>
        <CardDescription>
          {settingsQr.isLoading ? (
            <Skeleton className="h-4 w-64" />
          ) : maxRows != null ? (
            <>Download Excel files for reporting. Up to {maxRows.toLocaleString()} rows per file.</>
          ) : (
            <>Download Excel files for reporting. Row count is capped by export max rows in settings.</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {EXPORT_KINDS.map(({ kind, label, description }) => (
          <div key={kind} className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-lg border p-3">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full"
              disabled={exportMut.isPending}
              onClick={() => exportMut.mutate(kind)}
            >
              <Download className="mr-2 h-4 w-4 shrink-0" aria-hidden />
              Download .xlsx
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
