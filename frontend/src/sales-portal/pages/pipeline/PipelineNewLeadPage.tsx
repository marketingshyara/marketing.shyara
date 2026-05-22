import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCreateLeadMutation } from "../../hooks/useSalesQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewLeadStepper } from "../../components/ui/NewLeadStepper";
import { IndianMobileField } from "../../components/IndianMobileField";
import { createLeadSchema } from "../../validation/schemas";
import { z } from "zod";

type FormValues = z.infer<typeof createLeadSchema>;

export function PipelineNewLeadPage() {
  const navigate = useNavigate();
  const create = useCreateLeadMutation();
  const form = useForm<FormValues>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: { clientName: "", clientPhone: "", clientEmail: "", notes: "" },
    mode: "onBlur"
  });

  const phoneError = form.formState.errors.clientPhone?.message;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Button variant="ghost" className="min-h-11 -ml-2" asChild>
        <Link to="/portal/pipeline">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Back
        </Link>
      </Button>

      <NewLeadStepper />

      <Card>
        <CardHeader>
          <CardTitle>Add lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => {
              create.mutate(
                {
                  clientName: values.clientName.trim(),
                  clientPhone: values.clientPhone,
                  clientEmail: values.clientEmail?.trim() || null,
                  notes: values.notes?.trim() || null
                },
                {
                  onSuccess: (res) => navigate(`/portal/pipeline/${res.lead.id}`)
                }
              );
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="new-client-name">Client name</Label>
              <Input
                id="new-client-name"
                className="min-h-11"
                aria-invalid={!!form.formState.errors.clientName}
                {...form.register("clientName")}
              />
              {form.formState.errors.clientName ? (
                <p className="text-xs text-destructive" role="alert">
                  {form.formState.errors.clientName.message}
                </p>
              ) : null}
            </div>
            <IndianMobileField
              id="new-client-phone"
              required
              value={form.watch("clientPhone")}
              onChange={(v) =>
                form.setValue("clientPhone", v, { shouldValidate: true, shouldDirty: true })
              }
              onBlur={() => void form.trigger("clientPhone")}
              error={phoneError}
            />
            <div className="space-y-2">
              <Label htmlFor="new-client-email">Email (optional)</Label>
              <Input
                id="new-client-email"
                type="email"
                className="min-h-11"
                autoComplete="email"
                {...form.register("clientEmail")}
              />
              {form.formState.errors.clientEmail ? (
                <p className="text-xs text-destructive" role="alert">
                  {form.formState.errors.clientEmail.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-notes">Notes (optional)</Label>
              <Textarea id="new-notes" {...form.register("notes")} />
            </div>
            <Button
              type="submit"
              className="min-h-11 w-full"
              disabled={create.isPending}
            >
              {create.isPending ? "Saving…" : "Add lead"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
