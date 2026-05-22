import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCreateLeadMutation } from "../../hooks/useSalesQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewLeadStepper } from "../../components/ui/NewLeadStepper";

type FormValues = {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
};

export function PipelineNewLeadPage() {
  const navigate = useNavigate();
  const create = useCreateLeadMutation();
  const form = useForm<FormValues>({
    defaultValues: { clientName: "", clientPhone: "", clientEmail: "", notes: "" }
  });

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
                  clientPhone: values.clientPhone.trim() || null,
                  clientEmail: values.clientEmail.trim() || null,
                  notes: values.notes.trim() || null
                },
                {
                  onSuccess: (res) => navigate(`/portal/pipeline/${res.lead.id}`)
                }
              );
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="new-client-name">Client name</Label>
              <Input id="new-client-name" className="min-h-11" {...form.register("clientName", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-client-phone">Phone</Label>
              <Input id="new-client-phone" className="min-h-11" {...form.register("clientPhone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-client-email">Email (optional)</Label>
              <Input id="new-client-email" type="email" className="min-h-11" {...form.register("clientEmail")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-notes">Notes (optional)</Label>
              <Textarea id="new-notes" {...form.register("notes")} />
            </div>
            <Button type="submit" className="min-h-11 w-full" disabled={create.isPending}>
              {create.isPending ? "Saving…" : "Add lead"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
