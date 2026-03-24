import { portalApi } from "@/lib/portal-api";

const reports = [
  { label: "Lead Report CSV", href: portalApi.leadsCsvUrl, filename: "shyara-leads.csv" },
  { label: "Commission Report CSV", href: portalApi.commissionsCsvUrl, filename: "shyara-commissions.csv" },
  { label: "Project Report CSV", href: portalApi.projectsCsvUrl, filename: "shyara-projects.csv" }
];

export default function PortalReportsPage() {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold">Reports & Exports</h2>
      <p className="mt-2 text-sm text-slate-400">CSV exports are Excel-friendly and generated directly from the backend.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {reports.map((report) => (
          <a
            key={report.label}
            href={report.href}
            download={report.filename}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-sm text-slate-100 hover:border-cyan-300/40"
          >
            {report.label}
          </a>
        ))}
      </div>
    </section>
  );
}
