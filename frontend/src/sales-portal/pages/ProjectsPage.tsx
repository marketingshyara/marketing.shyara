import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateProjectMutation,
  useLeadsQuery,
  useProjectsQuery,
  useSessionQuery
} from "../hooks/useSalesQueries";
import { QueryErrorAlert } from "../components/QueryErrorAlert";

const createProjectFormSchema = z.object({
  leadId: z.string().min(1),
  title: z.string().min(1).max(200),
  metadataJson: z.string().optional()
});
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function ProjectsPage() {
  const { data: session } = useSessionQuery();
  const isAdmin = session?.user?.role === "ADMIN";
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading, isError, refetch } = useProjectsQuery(page, pageSize);
  const {
    data: leadsData,
    isError: leadsError,
    refetch: refetchLeads
  } = useLeadsQuery({ page: 1, pageSize: 100, enabled: isAdmin });
  const create = useCreateProjectMutation();

  const form = useForm<z.infer<typeof createProjectFormSchema>>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      leadId: "",
      title: "",
      metadataJson: ""
    }
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  useEffect(() => {
    if (data == null) return;
    const tp = Math.max(1, Math.ceil(data.total / pageSize));
    setPage((p) => Math.min(p, tp));
  }, [data, pageSize]);

  const leadChoices = leadsData?.items ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Projects</h1>
          <p className="text-sm text-muted-foreground">Per-lead project records.</p>
        </div>
        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="min-h-11 w-full sm:w-auto">New project</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create project</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit((v) => {
                  let metadata: Record<string, unknown> | null = null;
                  if (v.metadataJson?.trim()) {
                    try {
                      metadata = JSON.parse(v.metadataJson) as Record<string, unknown>;
                    } catch {
                      form.setError("metadataJson", { message: "Invalid JSON" });
                      return;
                    }
                  }
                  create.mutate(
                    { leadId: v.leadId, title: v.title, metadata },
                    { onSuccess: () => form.reset() }
                  );
                })}
              >
                <div className="space-y-2">
                  <Label>Lead</Label>
                  {leadsError && (
                    <QueryErrorAlert
                      message="Could not load leads for this form."
                      onRetry={() => void refetchLeads()}
                    />
                  )}
                  <Select
                    value={form.watch("leadId")}
                    onValueChange={(id) => form.setValue("leadId", id)}
                    disabled={leadsError}
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue placeholder="Select lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadChoices.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.clientName} ({l.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input className="min-h-11" {...form.register("title")} />
                </div>
                <div className="space-y-2">
                  <Label>Metadata (JSON object, optional)</Label>
                  <Textarea
                    rows={4}
                    className="min-w-0 break-words font-mono text-sm"
                    {...form.register("metadataJson")}
                  />
                  {form.formState.errors.metadataJson && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.metadataJson.message}
                    </p>
                  )}
                </div>
                <Button type="submit" className="min-h-11 w-full" disabled={create.isPending}>
                  Create
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isError && (
        <QueryErrorAlert
          message="Could not load projects."
          onRetry={() => void refetch()}
        />
      )}
      {isLoading && <Skeleton className="h-48 w-full" />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data?.items.map((p) => (
          <Link key={p.id} to={`/portal/projects/${p.id}`}>
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardContent className="p-4">
                <p className="font-medium">{p.title}</p>
                {p.lead && (
                  <p className="mt-1 text-sm text-muted-foreground">{p.lead.clientName}</p>
                )}
                {p.lead && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {p.lead.status.replace(/_/g, " ")}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {data && data.items.length === 0 && (
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      )}

      {data && totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center justify-center gap-2"
          aria-label="Projects pagination"
        >
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((x) => x - 1)}
            className="min-h-11"
          >
            Previous
          </Button>
          <span className="w-full basis-full px-2 text-center text-sm text-muted-foreground sm:w-auto sm:basis-auto">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((x) => x + 1)}
            className="min-h-11"
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
