import { useExportMutation } from "../hooks/useSalesQueries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet } from "lucide-react";

export function ExportsPage() {
  const exp = useExportMutation();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">Exports</h1>
        <p className="text-sm text-muted-foreground">
          Download XLSX files (row caps follow portal settings).
        </p>
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
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Leads
          </Button>
          <Button
            variant="outline"
            className="min-h-11 w-full justify-start"
            disabled={exp.isPending}
            onClick={() => exp.mutate("commissions")}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Commissions
          </Button>
          <Button
            variant="outline"
            className="min-h-11 w-full justify-start"
            disabled={exp.isPending}
            onClick={() => exp.mutate("users")}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Users
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
