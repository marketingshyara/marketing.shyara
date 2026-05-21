import { Link, Navigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { useLeadQuery, useSessionQuery } from "../../hooks/useSalesQueries";
import { PipelineDetailPage } from "./PipelineDetailPage";

function AdminPipelineDetailRedirect({ leadId }: { leadId: string | undefined }) {
  const leadQr = useLeadQuery(leadId, !!leadId);

  if (!leadId) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p className="text-sm text-destructive">Missing project id.</p>
        <Button asChild variant="link" className="min-h-11">
          <Link to="/portal/team">Back to team</Link>
        </Button>
      </div>
    );
  }

  if (leadQr.isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (leadQr.isError || !leadQr.data?.lead) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <QueryErrorAlert
          message="Could not load this project."
          onRetry={() => void leadQr.refetch()}
        />
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="min-h-11">
            <Link to="/portal/team">Team</Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11">
            <Link to="/portal/reviews">Reviews</Link>
          </Button>
        </div>
      </div>
    );
  }

  const lead = leadQr.data.lead;
  if (lead.assignedToUserId) {
    return (
      <Navigate
        to={`/portal/team/${lead.assignedToUserId}/projects/${lead.id}`}
        replace
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <p className="text-sm text-muted-foreground">
        This project has no assigned rep. Assign a rep on the team page before opening it here.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="min-h-11">
          <Link to="/portal/team">Team</Link>
        </Button>
        <Button asChild variant="outline" className="min-h-11">
          <Link to="/portal/reviews">Verification queue</Link>
        </Button>
      </div>
    </div>
  );
}

/** Role-aware entry for /portal/pipeline/:id — reps see detail; admins redirect to team project. */
export function PipelineDetailGate() {
  const { id } = useParams<{ id: string }>();
  const sessionQr = useSessionQuery();
  const user = sessionQr.data?.user;

  if (sessionQr.isLoading || (sessionQr.isFetching && !user)) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (user?.role === "ADMIN") {
    return <AdminPipelineDetailRedirect leadId={id} />;
  }

  return <PipelineDetailPage />;
}
