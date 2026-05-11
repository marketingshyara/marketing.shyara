import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { parseRupeeInputToCents } from "../../lib/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { QueryErrorAlert } from "../QueryErrorAlert";
import { usePatchLeadMutation, useUsersQuery } from "../../hooks/useSalesQueries";
import type { Lead, User } from "../../types";
import { leadStatusLabel } from "../../lib/copy";

type Props = {
  lead: Lead;
  isAdmin: boolean;
  terminal: boolean;
};

type FormShape = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  advanceRupees: string;
  finalQuoteRupees: string;
  assignedToUserId: string;
};

/**
 * Owns its own form state and patch mutation so the orchestrator doesn't need to know about the
 * shape of the edit form. The mutation is scoped to this lead's id and invalidates queries through
 * the underlying hook - the parent doesn't need to coordinate refetching.
 */
export function LeadEditForm({ lead, isAdmin, terminal }: Props) {
  const patch = usePatchLeadMutation(lead.id);
  const {
    data: usersData,
    isError: usersError,
    isLoading: usersLoading,
    refetch: refetchUsers
  } = useUsersQuery(1, 100, isAdmin);
  const reps: User[] =
    usersData?.items.filter((u) => u.role === "SALES_REP" && u.isActive) ?? [];

  const form = useForm<FormShape>({
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      notes: "",
      advanceRupees: "",
      finalQuoteRupees: "",
      assignedToUserId: ""
    },
    values: {
      clientName: lead.clientName,
      clientEmail: lead.clientEmail ?? "",
      clientPhone: lead.clientPhone ?? "",
      notes: lead.notes ?? "",
      advanceRupees:
        lead.advanceAmountCents != null ? String(lead.advanceAmountCents / 100) : "",
      finalQuoteRupees:
        lead.finalQuoteCents != null ? String(lead.finalQuoteCents / 100) : "",
      assignedToUserId: lead.assignedToUserId ?? ""
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Client & quotes</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={form.handleSubmit((vals) => {
            if (terminal) return;
            let ok = true;
            if (
              vals.advanceRupees.trim() !== "" &&
              parseRupeeInputToCents(vals.advanceRupees) === null
            ) {
              form.setError("advanceRupees", { message: "Enter a valid amount" });
              ok = false;
            }
            if (
              vals.finalQuoteRupees.trim() !== "" &&
              parseRupeeInputToCents(vals.finalQuoteRupees) === null
            ) {
              form.setError("finalQuoteRupees", { message: "Enter a valid amount" });
              ok = false;
            }
            if (!ok) return;
            const adv = parseRupeeInputToCents(vals.advanceRupees);
            const fin = parseRupeeInputToCents(vals.finalQuoteRupees);
            const body: Record<string, unknown> = {
              clientName: vals.clientName,
              clientEmail: vals.clientEmail.trim() === "" ? null : vals.clientEmail,
              clientPhone: vals.clientPhone.trim() === "" ? null : vals.clientPhone,
              notes: vals.notes.trim() === "" ? null : vals.notes,
              advanceAmountCents: adv,
              finalQuoteCents: fin
            };
            if (isAdmin) {
              body.assignedToUserId =
                vals.assignedToUserId === "" ? null : vals.assignedToUserId;
            }
            patch.mutate(body);
          })}
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`client-name-${lead.id}`}>Client name</Label>
            <Input
              id={`client-name-${lead.id}`}
              className="min-h-11"
              {...form.register("clientName")}
              disabled={terminal}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`client-email-${lead.id}`}>Email</Label>
            <Input
              id={`client-email-${lead.id}`}
              className="min-h-11"
              type="email"
              autoComplete="email"
              {...form.register("clientEmail")}
              disabled={terminal}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`client-phone-${lead.id}`}>Phone</Label>
            <Input
              id={`client-phone-${lead.id}`}
              className="min-h-11"
              type="tel"
              autoComplete="tel"
              {...form.register("clientPhone")}
              disabled={terminal}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`advance-${lead.id}`}>Advance (₹)</Label>
            <Input
              id={`advance-${lead.id}`}
              className="min-h-11"
              aria-invalid={!!form.formState.errors.advanceRupees}
              aria-describedby={
                form.formState.errors.advanceRupees ? `advance-err-${lead.id}` : undefined
              }
              {...form.register("advanceRupees")}
              disabled={terminal}
            />
            {form.formState.errors.advanceRupees && (
              <p id={`advance-err-${lead.id}`} className="text-sm text-destructive">
                {form.formState.errors.advanceRupees.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`final-quote-${lead.id}`}>Final quote (₹)</Label>
            <Input
              id={`final-quote-${lead.id}`}
              className="min-h-11"
              aria-invalid={!!form.formState.errors.finalQuoteRupees}
              aria-describedby={
                form.formState.errors.finalQuoteRupees ? `final-quote-err-${lead.id}` : undefined
              }
              {...form.register("finalQuoteRupees")}
              disabled={terminal}
            />
            {form.formState.errors.finalQuoteRupees && (
              <p id={`final-quote-err-${lead.id}`} className="text-sm text-destructive">
                {form.formState.errors.finalQuoteRupees.message}
              </p>
            )}
          </div>
          {isAdmin && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`assigned-${lead.id}`}>Assigned sales rep</Label>
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
                value={form.watch("assignedToUserId") || "__none__"}
                onValueChange={(v) =>
                  form.setValue("assignedToUserId", v === "__none__" ? "" : v)
                }
                disabled={terminal || usersLoading || usersError}
              >
                <SelectTrigger id={`assigned-${lead.id}`} className="min-h-11">
                  <SelectValue placeholder={usersLoading ? "Loading reps…" : "Unassigned"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {reps.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.displayName ?? u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`notes-${lead.id}`}>Notes</Label>
            <Textarea
              id={`notes-${lead.id}`}
              rows={4}
              {...form.register("notes")}
              disabled={terminal}
            />
          </div>
          {!terminal && (
            <Button type="submit" className="min-h-11 sm:col-span-2" disabled={patch.isPending}>
              Save changes
            </Button>
          )}
        </form>
        <div className="mt-4 space-y-1 border-t pt-4 text-sm text-muted-foreground">
          <p>
            Created by <span className="font-medium">{lead.createdByUserId}</span>
          </p>
          <p>
            Assigned to{" "}
            {lead.assignedToUserId ? (
              <span className="font-medium">{lead.assignedToUserId}</span>
            ) : (
              "—"
            )}
          </p>
          <p>Current stage: {leadStatusLabel(lead.status)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
