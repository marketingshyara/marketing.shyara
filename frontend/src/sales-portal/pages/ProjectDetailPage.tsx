import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import {
  useProjectQuery,
  usePatchProjectMutation,
  useSessionQuery,
  useVerifyProjectDeploymentMutation
} from "../hooks/useSalesQueries";
import { QueryErrorAlert } from "../components/QueryErrorAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSessionQuery();
  const isAdmin = session?.user?.role === "ADMIN";
  const { data, isLoading, isError, refetch } = useProjectQuery(id, !!id);
  const project = data?.project;
  const patch = usePatchProjectMutation(id ?? "");
  const verifyDep = useVerifyProjectDeploymentMutation(id, project?.leadId ?? "");

  const form = useForm({
    defaultValues: {
      title: "",
      metadataJson: "",
      previewUrl: "",
      deployedUrl: "",
      markDeploymentSubmitted: false
    },
    values: project
      ? {
          title: project.title,
          metadataJson: project.metadata
            ? JSON.stringify(project.metadata, null, 2)
            : "",
          previewUrl: project.previewUrl ?? "",
          deployedUrl: project.deployedUrl ?? "",
          markDeploymentSubmitted: false
        }
      : undefined
  });

  if (!id) {
    return (
      <p className="text-destructive">
        Invalid project. <Link to="/portal/projects">Back</Link>
      </p>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="ghost" className="min-h-11" asChild>
          <Link to="/portal/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Projects
          </Link>
        </Button>
        <QueryErrorAlert
          message="Could not load this project."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (isLoading || !project) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button variant="ghost" className="min-h-11" asChild>
        <Link to="/portal/projects">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Projects
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.lead && (
            <p className="text-sm text-muted-foreground">
              Lead:{" "}
              <Link
                className="font-medium text-primary underline underline-offset-2"
                to={`/portal/leads/${project.lead.id}`}
              >
                {project.lead.clientName}
              </Link>
            </p>
          )}
          {isAdmin ? (
            <>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((v) => {
                let metadata: Record<string, unknown> | null = null;
                if (v.metadataJson.trim()) {
                  try {
                    metadata = JSON.parse(v.metadataJson) as Record<string, unknown>;
                  } catch {
                    form.setError("metadataJson", { message: "Invalid JSON" });
                    return;
                  }
                } else {
                  metadata = null;
                }
                patch.mutate(
                  {
                    title: v.title,
                    metadata,
                    previewUrl: v.previewUrl.trim() === "" ? null : v.previewUrl.trim(),
                    deployedUrl: v.deployedUrl.trim() === "" ? null : v.deployedUrl.trim(),
                    ...(v.markDeploymentSubmitted ? { markDeploymentSubmitted: true } : {})
                  },
                  { onSuccess: () => toast.success("Project Updated.") }
                );
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="project-title">Title</Label>
                <Input id="project-title" className="min-h-11" {...form.register("title")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-preview">Preview URL</Label>
                <Input id="project-preview" className="min-h-11" {...form.register("previewUrl")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-deployed">Deployed URL</Label>
                <Input id="project-deployed" className="min-h-11" {...form.register("deployedUrl")} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="project-mark-deploy"
                  checked={form.watch("markDeploymentSubmitted")}
                  onCheckedChange={(c) => form.setValue("markDeploymentSubmitted", c === true)}
                />
                <Label htmlFor="project-mark-deploy" className="text-sm font-normal">
                  Mark deployment as submitted (requires deployed URL)
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-metadata">Metadata (JSON)</Label>
                <Textarea
                  id="project-metadata"
                  rows={10}
                  className="min-w-0 break-words font-mono text-sm"
                  {...form.register("metadataJson")}
                />
                {form.formState.errors.metadataJson && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.metadataJson.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={patch.isPending}>
                Save
              </Button>
            </form>
            {project.deploymentSubmittedAt &&
              !project.deploymentVerifiedAt &&
              project.lead &&
              (project.lead.status === "FINAL_PAID" || project.lead.status === "DEPLOYED") && (
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
                    Records commission from the lead&apos;s agreed total after you confirm the site is live.
                  </p>
                </div>
              )}
            </>
          ) : (
            <pre className="max-h-[50dvh] overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted p-3 text-xs">
              {project.metadata ? JSON.stringify(project.metadata, null, 2) : "—"}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
