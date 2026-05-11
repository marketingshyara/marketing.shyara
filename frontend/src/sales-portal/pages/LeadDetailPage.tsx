import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorAlert } from "../components/QueryErrorAlert";
import { LeadHeader } from "../components/lead-detail/LeadHeader";
import { LeadEditForm } from "../components/lead-detail/LeadEditForm";
import { LeadStatusPanel } from "../components/lead-detail/LeadStatusPanel";
import { LeadPaymentsPanel } from "../components/lead-detail/LeadPaymentsPanel";
import {
  useLeadQuery,
  usePortalSettingsQuery,
  useSessionQuery
} from "../hooks/useSalesQueries";
import { isLeadTerminal } from "../lib/leadUi";
import { formatMinorUnits } from "../lib/money";
import { ArrowLeft } from "lucide-react";

/**
 * Thin orchestrator: handles loading/error states, then delegates the four detail panels to
 * dedicated components. Each child owns its own mutation, form state, and dialog state - the
 * orchestrator just passes the resolved `lead` + `settings` + `role` down one level.
 */
export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSessionQuery();
  const {
    data: settingsRes,
    isLoading: settingsLoading,
    isError: settingsError,
    refetch: refetchSettings
  } = usePortalSettingsQuery();
  const { data, isLoading, isError, refetch: refetchLead } = useLeadQuery(id);

  if (isLoading || settingsLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (settingsError || !settingsRes?.settings) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {settingsError ? (
          <QueryErrorAlert
            message="Could not load portal settings."
            onRetry={() => void refetchSettings()}
          />
        ) : (
          <p className="text-destructive" role="alert">Could not load portal settings.</p>
        )}
        <Button asChild variant="link" className="mt-2">
          <Link to="/portal/leads">Back to leads</Link>
        </Button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <QueryErrorAlert
          message="Could not load this lead."
          onRetry={() => void refetchLead()}
        />
        <Button asChild variant="link">
          <Link to="/portal/leads">Back to leads</Link>
        </Button>
      </div>
    );
  }

  const lead = data?.lead;
  const settings = settingsRes.settings;
  const role = session?.user?.role;

  if (!lead || !role) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-destructive" role="alert">Lead not found or no access.</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/portal/leads">Back to leads</Link>
        </Button>
      </div>
    );
  }

  const isAdmin = role === "ADMIN";
  const terminal = isLeadTerminal(lead, settings);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" className="min-h-11 -ml-2" asChild>
        <Link to="/portal/leads">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Back to Leads
        </Link>
      </Button>
      <LeadHeader status={lead.status} terminal={terminal} />
      <LeadEditForm lead={lead} isAdmin={isAdmin} terminal={terminal} />
      <LeadStatusPanel lead={lead} settings={settings} role={role} terminal={terminal} />
      <LeadPaymentsPanel lead={lead} settings={settings} isAdmin={isAdmin} terminal={terminal} />

      {lead.commission && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Commission</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              Amount: {formatMinorUnits(lead.commission.amountCents)} · Paid:{" "}
              {lead.commission.isPaid ? "Yes" : "No"}
            </p>
            <Button asChild variant="link" className="h-auto px-0">
              <Link to="/portal/commissions">View in commissions</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {lead.project && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="min-h-11">
              <Link to={`/portal/projects/${lead.project.id}`}>{lead.project.title}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
