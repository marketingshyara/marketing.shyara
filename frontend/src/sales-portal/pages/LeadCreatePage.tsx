import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { QueryErrorAlert } from "../components/QueryErrorAlert";
import { createLeadSchema } from "../validation/schemas";
import { useCreateLeadMutation, useSessionQuery, useUsersQuery } from "../hooks/useSalesQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseRupeeInputToCents } from "../lib/money";
import { ArrowLeft } from "lucide-react";

type FormValues = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  advanceRupees: string;
  finalQuoteRupees: string;
  assignedToUserId: string;
};

export function LeadCreatePage() {
  const navigate = useNavigate();
  const { data: session } = useSessionQuery();
  const isAdmin = session?.user?.role === "ADMIN";
  const {
    data: usersData,
    isError: usersError,
    isLoading: usersLoading,
    refetch: refetchUsers
  } = useUsersQuery(1, 100, isAdmin);
  const create = useCreateLeadMutation();

  const reps =
    usersData?.items.filter((u) => u.role === "SALES_REP" && u.isActive) ?? [];

  const form = useForm<FormValues>({
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      notes: "",
      advanceRupees: "",
      finalQuoteRupees: "",
      assignedToUserId: ""
    }
  });

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Button variant="ghost" className="min-h-11 -ml-2" asChild>
        <Link to="/portal/leads">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Leads
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>New lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((raw) => {
              form.clearErrors();
              const advanceAmountCents = parseRupeeInputToCents(raw.advanceRupees);
              const finalQuoteCents = parseRupeeInputToCents(raw.finalQuoteRupees);
              if (raw.advanceRupees.trim() && advanceAmountCents === null) {
                form.setError("advanceRupees", { message: "Invalid amount" });
                return;
              }
              if (raw.finalQuoteRupees.trim() && finalQuoteCents === null) {
                form.setError("finalQuoteRupees", { message: "Invalid amount" });
                return;
              }

              const parsed = createLeadSchema.safeParse({
                clientName: raw.clientName,
                clientEmail: raw.clientEmail.trim() === "" ? undefined : raw.clientEmail,
                clientPhone: raw.clientPhone.trim() === "" ? null : raw.clientPhone,
                notes: raw.notes.trim() === "" ? null : raw.notes,
                advanceAmountCents: advanceAmountCents ?? null,
                finalQuoteCents: finalQuoteCents ?? null,
                assignedToUserId:
                  isAdmin && raw.assignedToUserId ? raw.assignedToUserId : undefined
              });
              if (!parsed.success) {
                parsed.error.errors.forEach((e) => {
                  const key = e.path[0];
                  if (key === "clientName") form.setError("clientName", { message: e.message });
                  if (key === "clientEmail") form.setError("clientEmail", { message: e.message });
                });
                return;
              }
              if (isAdmin && !parsed.data.assignedToUserId) {
                form.setError("assignedToUserId", { message: "Choose a sales rep" });
                return;
              }

              const body: Record<string, unknown> = {
                clientName: parsed.data.clientName,
                clientEmail: parsed.data.clientEmail ?? null,
                clientPhone: parsed.data.clientPhone,
                notes: parsed.data.notes,
                advanceAmountCents: parsed.data.advanceAmountCents,
                finalQuoteCents: parsed.data.finalQuoteCents
              };
              if (isAdmin) body.assignedToUserId = parsed.data.assignedToUserId;
              create.mutate(body, {
                onSuccess: (res) => navigate(`/portal/leads/${res.lead.id}`, { replace: true })
              });
            })}
          >
            {isAdmin && (
              <div className="space-y-2">
                <Label>Assigned sales rep</Label>
                {usersError && (
                  <QueryErrorAlert
                    message="Could not load sales reps."
                    onRetry={() => void refetchUsers()}
                  />
                )}
                {!usersError && !usersLoading && reps.length === 0 && (
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
                    No active sales reps.{" "}
                    <Link className="font-semibold underline underline-offset-2" to="/portal/users">
                      Add a user
                    </Link>{" "}
                    first.
                  </p>
                )}
                <Select
                  value={form.watch("assignedToUserId")}
                  onValueChange={(v) => form.setValue("assignedToUserId", v)}
                  disabled={usersLoading || usersError}
                >
                  <SelectTrigger className="min-h-11">
                    <SelectValue
                      placeholder={usersLoading ? "Loading reps…" : "Select rep"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {reps.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.displayName ?? u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.assignedToUserId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.assignedToUserId.message}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cn">Client name</Label>
              <Input id="cn" className="min-h-11" {...form.register("clientName")} />
              {form.formState.errors.clientName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.clientName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ce">Client email</Label>
              <Input id="ce" type="email" className="min-h-11" {...form.register("clientEmail")} />
              {form.formState.errors.clientEmail && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.clientEmail.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp">Client phone</Label>
              <Input id="cp" className="min-h-11" {...form.register("clientPhone")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="adv">Advance (₹)</Label>
                <Input id="adv" inputMode="decimal" className="min-h-11" {...form.register("advanceRupees")} />
                {form.formState.errors.advanceRupees && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.advanceRupees.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fq">Final quote (₹)</Label>
                <Input id="fq" inputMode="decimal" className="min-h-11" {...form.register("finalQuoteRupees")} />
                {form.formState.errors.finalQuoteRupees && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.finalQuoteRupees.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="no">Notes</Label>
              <Textarea id="no" rows={4} {...form.register("notes")} />
            </div>
            <Button type="submit" className="min-h-11 w-full" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create lead"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
