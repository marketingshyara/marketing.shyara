import {
  PortalPageHeader,
  PortalPanel,
  PortalSectionHeading
} from "@/components/portal/portal-ui";
import { portalButtonSecondaryClass } from "@/components/portal/portal-theme";
import { portalApi } from "@/lib/portal-api";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

const reports = [
  { label: "Lead Report CSV", href: portalApi.leadsCsvUrl, filename: "shyara-leads.csv" },
  { label: "Commission Report CSV", href: portalApi.commissionsCsvUrl, filename: "shyara-commissions.csv" },
  { label: "Project Report CSV", href: portalApi.projectsCsvUrl, filename: "shyara-projects.csv" }
];

export default function PortalReportsPage() {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        eyebrow="Reports"
        title="Export operational data in the same polished interface"
        description="CSV exports stay backend-driven, but the report surface now matches the main website's cleaner cards, spacing, and contrast."
      />

      <PortalPanel>
        <PortalSectionHeading
          title="Reports and Exports"
          description="CSV exports are Excel-friendly and generated directly from the backend."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {reports.map((report) => (
            <a
              key={report.label}
              href={report.href}
              download={report.filename}
              className="portal-list-card transition hover:border-accent/30 hover:shadow-elevated"
            >
              <div className="flex h-full flex-col justify-between gap-4">
                <div>
                  <p className="portal-eyebrow">CSV Export</p>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">{report.label}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{report.filename}</p>
                </div>
                <span className={cn(portalButtonSecondaryClass, "w-full")}>
                  <Download className="h-4 w-4" />
                  Download
                </span>
              </div>
            </a>
          ))}
        </div>
      </PortalPanel>
    </div>
  );
}
