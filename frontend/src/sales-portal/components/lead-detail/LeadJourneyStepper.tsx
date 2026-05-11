import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Lead } from "../../types";

type Props = {
  lead: Lead;
};

function hasVerifiedAdvance(lead: Lead): boolean {
  return (
    lead.payments?.some(
      (p) => p.kind === "ADVANCE" && p.verificationStatus === "VERIFIED"
    ) ?? false
  );
}

function pendingPayment(lead: Lead, kind: "ADVANCE" | "FINAL"): boolean {
  return lead.payments?.some((p) => p.kind === kind && p.verificationStatus === "PENDING") ?? false;
}

/**
 * Checklist-style journey for the lead workspace: maps machine state to plain-language steps.
 */
export function LeadJourneyStepper({ lead }: Props) {
  const payments = lead.payments ?? [];
  const advancePending = pendingPayment(lead, "ADVANCE");
  const finalPending = pendingPayment(lead, "FINAL");
  const verifiedAdvance = hasVerifiedAdvance(lead);
  const proj = lead.project;

  const agreedDone = (lead.agreedTotalCents ?? 0) > 0;
  const advancePathDone =
    lead.status !== "NEW" || payments.some((p) => p.kind === "ADVANCE");
  const advanceVerifiedDone = verifiedAdvance;
  const templateDone = Boolean(lead.websiteTemplateId);
  const contentDone = Boolean(lead.contentReceivedAt);
  const buildDone = ["BUILDING", "PREVIEW_SENT", "FINAL_PAID", "DEPLOYED", "COMMISSION_PAID"].includes(
    lead.status
  );
  const previewDone = ["PREVIEW_SENT", "FINAL_PAID", "DEPLOYED", "COMMISSION_PAID"].includes(lead.status);
  const finalPaidDone = ["FINAL_PAID", "DEPLOYED", "COMMISSION_PAID"].includes(lead.status);
  const submittedDeploy = Boolean(proj?.deploymentSubmittedAt);
  const verifiedDeploy = Boolean(proj?.deploymentVerifiedAt);
  const commissionRow = Boolean(lead.commission);

  const steps: { label: string; done: boolean; actor?: "rep" | "admin" }[] = [
    { label: "Agreed project total captured", done: agreedDone, actor: "rep" },
    { label: "Advance recorded", done: advancePathDone, actor: "rep" },
    {
      label: "Advance verified by admin",
      done: advanceVerifiedDone,
      actor: "admin"
    },
    { label: "Template selected", done: templateDone, actor: "rep" },
    { label: "Content received", done: contentDone, actor: "rep" },
    { label: "Build in progress / preview", done: buildDone, actor: "admin" },
    { label: "Preview shared (lead reached preview stage)", done: previewDone, actor: "admin" },
    { label: "Final payment recorded & verified", done: finalPaidDone, actor: "rep" },
    { label: "Live URL submitted", done: submittedDeploy, actor: "rep" },
    { label: "Deployment verified by admin", done: verifiedDeploy, actor: "admin" },
    { label: "Commission recorded", done: commissionRow, actor: "admin" }
  ];

  return (
    <div className="space-y-3">
      {advancePending && (
        <Alert>
          <AlertTitle>Advance submitted — waiting for admin</AlertTitle>
          <AlertDescription>
            Your advance payment is pending verification. You will be notified when it is approved.
          </AlertDescription>
        </Alert>
      )}
      {finalPending && (
        <Alert>
          <AlertTitle>Due submitted — waiting for admin</AlertTitle>
          <AlertDescription>
            Your final payment is pending verification. You will be notified when it is approved.
          </AlertDescription>
        </Alert>
      )}
      {submittedDeploy && !verifiedDeploy && (
        <Alert>
          <AlertTitle>Live URL submitted — waiting for admin approval</AlertTitle>
          <AlertDescription>
            An administrator must verify deployment before this lead is marked complete for payout.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lead journey</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-0.5 shrink-0 font-mono text-muted-foreground" aria-hidden>
                  {s.done ? "✓" : "○"}
                </span>
                <div>
                  <span className={s.done ? "text-muted-foreground" : "font-medium"}>{s.label}</span>
                  {s.actor ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({s.actor === "rep" ? "Sales rep" : "Admin"})
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Current lead status: <span className="font-medium">{lead.status}</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
