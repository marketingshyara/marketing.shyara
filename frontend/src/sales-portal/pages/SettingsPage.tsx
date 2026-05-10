import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdminSettingsQuery, usePatchSettingsMutation } from "../hooks/useSalesQueries";
import { portalSettingsSchema } from "../validation/schemas";
import type { LeadStatus, PortalSettingsValues } from "../types";
import { bpsToPercentLabel } from "../lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { QueryErrorAlert } from "../components/QueryErrorAlert";

const LEAD_STATUSES: LeadStatus[] = [
  "NEW",
  "ADVANCE_PAID",
  "BUILDING",
  "PREVIEW_SENT",
  "FINAL_PAID",
  "DEPLOYED",
  "COMMISSION_PAID"
];

export function SettingsPage() {
  const { data, isLoading, isError, refetch } = useAdminSettingsQuery(true);
  const patch = usePatchSettingsMutation();
  const settings = data?.settings;

  const form = useForm<PortalSettingsValues>({
    resolver: zodResolver(portalSettingsSchema),
    values: settings
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "manualTransitions"
  });

  if (isError && !settings) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Portal settings</h1>
          <p className="text-sm text-muted-foreground">
            Workflow gates and commission calculation.
          </p>
        </div>
        <QueryErrorAlert
          message="Could not load settings."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (isLoading || !settings) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">Portal settings</h1>
        <p className="text-sm text-muted-foreground">
          Workflow gates and commission calculation. Unknown keys are rejected by the API.
        </p>
      </div>

      <form
        className="space-y-6"
        onSubmit={form.handleSubmit((v) => patch.mutate(v), () => {
          toast.error("Fix the highlighted fields before saving.");
        })}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Commission rate (basis points, 10000 = 100%)</Label>
              <Input
                type="number"
                className="min-h-11"
                {...form.register("commissionRateBps", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Current: {bpsToPercentLabel(Number(form.watch("commissionRateBps") ?? 0))}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Commission basis</Label>
              <Select
                value={form.watch("commissionBasis")}
                onValueChange={(v) =>
                  form.setValue("commissionBasis", v as PortalSettingsValues["commissionBasis"])
                }
              >
                <SelectTrigger className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VERIFIED_FINAL_PAYMENT">Verified final payment amount</SelectItem>
                  <SelectItem value="FINAL_QUOTE">Final quote on lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Manual transitions</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11"
              onClick={() =>
                append({
                  from: "NEW",
                  to: "ADVANCE_PAID",
                  adminOnly: false,
                  enabled: true
                })
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, i) => (
              <div key={field.id} className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="space-y-2">
                  <Label className="text-xs">From</Label>
                  <Select
                    value={form.watch(`manualTransitions.${i}.from`)}
                    onValueChange={(v) => form.setValue(`manualTransitions.${i}.from`, v as LeadStatus)}
                  >
                    <SelectTrigger className="min-h-11 w-full sm:w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">To</Label>
                  <Select
                    value={form.watch(`manualTransitions.${i}.to`)}
                    onValueChange={(v) => form.setValue(`manualTransitions.${i}.to`, v as LeadStatus)}
                  >
                    <SelectTrigger className="min-h-11 w-full sm:w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.watch(`manualTransitions.${i}.adminOnly`)}
                    onCheckedChange={(c) => form.setValue(`manualTransitions.${i}.adminOnly`, c)}
                  />
                  <Label className="text-xs">Admin only</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.watch(`manualTransitions.${i}.enabled`)}
                    onCheckedChange={(c) => form.setValue(`manualTransitions.${i}.enabled`, c)}
                  />
                  <Label className="text-xs">Enabled</Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment &amp; verify gates</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["advancePaymentRequiredLeadStatus", "Mark advance payment — lead status"],
                ["finalPaymentRequiredLeadStatus", "Mark final payment — lead status"],
                ["advanceVerifyRequiredLeadStatus", "Verify advance — lead status"],
                ["finalVerifyRequiredLeadStatus", "Verify final — lead status"]
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label className="text-xs">{label}</Label>
                <Select
                  value={form.watch(key)}
                  onValueChange={(v) => form.setValue(key, v as LeadStatus)}
                >
                  <SelectTrigger className="min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Terminal statuses (no mutations)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {LEAD_STATUSES.map((s) => {
              const list = form.watch("terminalNoMutationStatuses") ?? [];
              const checked = list.includes(s);
              return (
                <label key={s} className="flex min-h-11 items-center gap-2 text-sm">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(on) => {
                      const next = on
                        ? [...list, s]
                        : list.filter((x) => x !== s);
                      form.setValue("terminalNoMutationStatuses", next);
                    }}
                  />
                  {s}
                </label>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Other</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Payment vs quote tolerance (basis points, empty = disabled)</Label>
              <Input
                className="min-h-11"
                inputMode="numeric"
                value={form.watch("enforcePaymentQuoteToleranceBps") ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") {
                    form.setValue("enforcePaymentQuoteToleranceBps", null, { shouldDirty: true });
                    return;
                  }
                  const n = Number.parseInt(v, 10);
                  form.setValue(
                    "enforcePaymentQuoteToleranceBps",
                    Number.isFinite(n) ? n : null,
                    { shouldDirty: true }
                  );
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Export max rows (100–500000)</Label>
              <Input
                type="number"
                className="min-h-11"
                {...form.register("exportMaxRows", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={patch.isPending}>
          Save settings
        </Button>
      </form>
    </div>
  );
}
