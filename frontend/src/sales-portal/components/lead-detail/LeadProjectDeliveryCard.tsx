import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  usePatchProjectMutation,
  useSessionQuery,
  useVerifyProjectDeploymentMutation
} from "../../hooks/useSalesQueries";
import type { Lead, Project } from "../../types";

type Props = {
  lead: Lead;
  isAdmin: boolean;
  terminal: boolean;
};

function LeadProjectDeliveryInner({
  lead,
  project,
  isAdmin,
  terminal
}: Props & { project: Project }) {
  const { data: session } = useSessionQuery();
  const role = session?.user?.role;
  const [deployUrl, setDeployUrl] = useState(project.deployedUrl ?? "");

  const patchProject = usePatchProjectMutation(project.id);
  const verifyDep = useVerifyProjectDeploymentMutation(project.id, lead.id);

  const submitted = Boolean(project.deploymentSubmittedAt);
  const verified = Boolean(project.deploymentVerifiedAt);
  const repCanSubmit =
    !terminal && role === "SALES_REP" && lead.status === "FINAL_PAID" && !verified;

  const adminCanVerify =
    isAdmin && submitted && !verified && (lead.status === "FINAL_PAID" || lead.status === "DEPLOYED");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Preview &amp; go-live</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-1">
          <span className="text-muted-foreground">Preview URL</span>
          <p className="break-all font-medium">
            {project.previewUrl ? (
              <a className="text-primary underline" href={project.previewUrl} target="_blank" rel="noreferrer">
                {project.previewUrl}
              </a>
            ) : (
              "—"
            )}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">Deployed URL</span>
          <p className="break-all font-medium">
            {project.deployedUrl ? (
              <a className="text-primary underline" href={project.deployedUrl} target="_blank" rel="noreferrer">
                {project.deployedUrl}
              </a>
            ) : (
              "—"
            )}
          </p>
        </div>
        {submitted && (
          <p className="text-xs text-muted-foreground">
            Submitted{" "}
            {project.deploymentSubmittedAt ? new Date(project.deploymentSubmittedAt).toLocaleString() : ""}
            {verified && project.deploymentVerifiedAt
              ? ` · Verified ${new Date(project.deploymentVerifiedAt).toLocaleString()}`
              : ""}
          </p>
        )}

        {repCanSubmit && (
          <form
            className="space-y-3 border-t pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              const u = deployUrl.trim();
              if (!u) {
                toast.error("Enter the live site URL.");
                return;
              }
              try {
                // eslint-disable-next-line no-new -- validate URL shape
                new URL(u);
              } catch {
                toast.error("Enter a valid http(s) URL.");
                return;
              }
              patchProject.mutate({
                deployedUrl: u,
                markDeploymentSubmitted: true
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor={`deploy-url-${lead.id}`}>Submit live URL for verification</Label>
              <Input
                id={`deploy-url-${lead.id}`}
                className="min-h-11"
                value={deployUrl}
                onChange={(e) => setDeployUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <Button type="submit" className="min-h-11" disabled={patchProject.isPending}>
              Submit for admin verification
            </Button>
          </form>
        )}

        {adminCanVerify && (
          <div className="border-t pt-4">
            <Button
              type="button"
              className="min-h-11"
              disabled={verifyDep.isPending}
              onClick={() => verifyDep.mutate()}
            >
              Verify deployment
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Confirms the site is live and records commission from the agreed total (requires agreed total on the
              lead).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LeadProjectDeliveryCard(props: Props) {
  const project = props.lead.project;
  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview &amp; go-live</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          A project will appear here once your administrator creates it for this lead.
        </CardContent>
      </Card>
    );
  }
  return <LeadProjectDeliveryInner {...props} project={project} />;
}
