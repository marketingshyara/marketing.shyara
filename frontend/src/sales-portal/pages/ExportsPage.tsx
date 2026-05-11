import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useExportMutation, invalidateQueryPrefixes } from "../hooks/useSalesQueries";
import { DataStaleToolbar } from "../components/DataStaleToolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet } from "lucide-react";

export function ExportsPage() {
  const exp = useExportMutation();
  const qc = useQueryClient();
  const [listsBustedAt, setListsBustedAt] = useState(() => Date.now());

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Exports</h1>
          <p className="text-sm text-muted-foreground">
            Download spreadsheet reports. Row limits follow your portal settings.
          </p>
        </div>
        <DataStaleToolbar
          dataUpdatedAt={listsBustedAt}
          onRefresh={() => {
            invalidateQueryPrefixes(qc, ["leads", "commissions", "users", "activity-logs"]);
            setListsBustedAt(Date.now());
          }}
          isFetching={false}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spreadsheets</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {exp.isPending && (
            <p className="text-sm text-muted-foreground" role="status">
              Preparing download…
            </p>
          )}
          <Button
            variant="outline"
            className="min-h-11 w-full justify-start"
            disabled={exp.isPending}
            onClick={() => exp.mutate("leads")}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden />
            Export Leads
          </Button>
          <Button
            variant="outline"
            className="min-h-11 w-full justify-start"
            disabled={exp.isPending}
            onClick={() => exp.mutate("commissions")}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden />
            Export Commissions
          </Button>
          <Button
            variant="outline"
            className="min-h-11 w-full justify-start"
            disabled={exp.isPending}
            onClick={() => exp.mutate("users")}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden />
            Export Users
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
