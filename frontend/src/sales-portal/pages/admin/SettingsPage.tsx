import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdminSettingsQuery, usePatchSettingsMutation } from "../../hooks/useSalesQueries";
import { portalSettingsSchema } from "../../validation/schemas";
import type { LeadStatus, PortalSettingsValues } from "../../types";
import { bpsToPercentLabel } from "../../lib/money";
import {
  PAYMENT_SHARE_METHOD_KEYS,
  PAYMENT_SHARE_METHOD_LABELS,
  mergePaymentShareMethods
} from "../../lib/paymentShareMethods";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { leadStatusLabel } from "../../lib/copy";
import { SettingsExportsCard } from "../../components/admin/SettingsExportsCard";
import { PortalPageHeader } from "../../components/PortalPageHeader";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle } from "lucide-react";

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
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useAdminSettingsQuery(true);
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
  const tutorialFields = useFieldArray({
    control: form.control,
    name: "tutorialLinks"
  });
  const painFields = useFieldArray({
    control: form.control,
    name: "painPointsByCategory"
  });

  if (isError && !settings) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <PortalPageHeader
          title="Portal settings"
          description="Workflow gates and commission calculation."
        />
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
      <PortalPageHeader
        title="Portal settings"
        variant="config"
        description="Lead flow, commissions, and safeguards."
        toolbar={
          <DataStaleToolbar
            dataUpdatedAt={dataUpdatedAt}
            onRefresh={() => void refetch()}
            isFetching={isFetching}
          />
        }
      />

      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(
          (v) =>
            patch.mutate({
              ...v,
              paymentShareMethods: mergePaymentShareMethods(v.paymentShareMethods)
            }),
          () => {
            toast.error("Fix the highlighted fields before saving.");
          }
        )}
      >
        <Tabs defaultValue="pricing" className="space-y-4">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="pricing" className="min-h-11 flex-1 sm:flex-none">
              Pricing
            </TabsTrigger>
            <TabsTrigger value="commission" className="min-h-11 flex-1 sm:flex-none">
              Commission
            </TabsTrigger>
            <TabsTrigger value="resources" className="min-h-11 flex-1 sm:flex-none">
              Resources
            </TabsTrigger>
            <TabsTrigger value="system" className="min-h-11 flex-1 sm:flex-none">
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-6 mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client onboarding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-min-total">Minimum agreed total (₹)</Label>
              <Input
                id="settings-min-total"
                type="number"
                className="min-h-11"
                value={Math.round(Number(form.watch("minAgreedTotalCents") ?? 0) / 100)}
                onChange={(e) => {
                  const rupees = Number.parseInt(e.target.value, 10);
                  form.setValue(
                    "minAgreedTotalCents",
                    Number.isFinite(rupees) ? rupees * 100 : 0,
                    { shouldDirty: true }
                  );
                }}
              />
              <p className="text-xs text-muted-foreground">Stored as paise in the database.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-advance-share">Advance payment share (%)</Label>
              <Input
                id="settings-advance-share"
                type="number"
                className="min-h-11"
                min={0}
                max={100}
                value={Math.round(Number(form.watch("advancePaymentShareBps") ?? 5000) / 100)}
                onChange={(e) => {
                  const pct = Number.parseInt(e.target.value, 10);
                  form.setValue(
                    "advancePaymentShareBps",
                    Number.isFinite(pct) ? pct * 100 : 5000,
                    { shouldDirty: true }
                  );
                }}
              />
              <p className="text-xs text-muted-foreground">
                Advance {bpsToPercentLabel(Number(form.watch("advancePaymentShareBps") ?? 5000))} / final{" "}
                {bpsToPercentLabel(10000 - Number(form.watch("advancePaymentShareBps") ?? 5000))}.
              </p>
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="commission" className="space-y-6 mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commission</CardTitle>
            <p className="text-sm text-muted-foreground">
              These rates and bonus rules apply to <strong>Model A</strong> sales reps only. Model B
              reps use fixed milestone payouts (₹10,000 at 5 site-live deals, then ₹2,000 per deal).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-commission-rate">Commission rate (%)</Label>
              <Input
                id="settings-commission-rate"
                type="number"
                className="min-h-11"
                min={0}
                max={100}
                value={Math.round(Number(form.watch("commissionRateBps") ?? 0) / 100)}
                onChange={(e) => {
                  const pct = Number.parseInt(e.target.value, 10);
                  form.setValue(
                    "commissionRateBps",
                    Number.isFinite(pct) ? pct * 100 : 0,
                    { shouldDirty: true }
                  );
                }}
              />
              <p className="text-xs text-muted-foreground">
                {bpsToPercentLabel(Number(form.watch("commissionRateBps") ?? 0))} of agreed project
                total (set at convert).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-commission-rounding">Commission rounding</Label>
              <Select
                value={form.watch("commissionRounding")}
                onValueChange={(v) =>
                  form.setValue("commissionRounding", v as PortalSettingsValues["commissionRounding"])
                }
              >
                <SelectTrigger id="settings-commission-rounding" className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bankers">Banker's rounding</SelectItem>
                  <SelectItem value="round">Round half up</SelectItem>
                  <SelectItem value="floor">Floor</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Use banker's rounding for balanced finance calculations across large volumes.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-bonus-percent">Performance bonus (%)</Label>
              <Input
                id="settings-bonus-percent"
                type="number"
                className="min-h-11"
                min={0}
                max={100}
                value={Math.round(Number(form.watch("performanceBonusBps") ?? 0) / 100)}
                onChange={(e) => {
                  const pct = Number.parseInt(e.target.value, 10);
                  form.setValue(
                    "performanceBonusBps",
                    Number.isFinite(pct) ? pct * 100 : 0,
                    { shouldDirty: true }
                  );
                }}
              />
              <p className="text-xs text-muted-foreground">
                Extra payout as {bpsToPercentLabel(Number(form.watch("performanceBonusBps") ?? 0))}{" "}
                of agreed project total when a rep hits the sales threshold (e.g. 5% on ₹10,000 =
                ₹500).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-bonus-threshold">
                Bonus after this many paid sales (10 = from 11th sale)
              </Label>
              <Input
                id="settings-bonus-threshold"
                type="number"
                className="min-h-11"
                {...form.register("performanceBonusAfterCompletedSales", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6 mt-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rep resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-templates-url">Templates catalog URL</Label>
              <Input
                id="settings-templates-url"
                className="min-h-11"
                {...form.register("templatesCatalogUrl")}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm font-medium">Tutorial links</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={() => tutorialFields.append({ title: "New tutorial", url: "https://" })}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add link
              </Button>
            </div>
            {tutorialFields.fields.map((field, i) => (
              <div key={field.id} className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs">Title</Label>
                  <Input className="min-h-11" {...form.register(`tutorialLinks.${i}.title`)} />
                </div>
                <div className="flex-[2] space-y-2">
                  <Label className="text-xs">URL</Label>
                  <Input className="min-h-11" {...form.register(`tutorialLinks.${i}.url`)} />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 w-full sm:w-auto"
                  onClick={() => tutorialFields.remove(i)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex items-center justify-between gap-2 pt-2">
              <Label className="text-sm font-medium">Pain points by category</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={() =>
                  painFields.append({
                    categoryId: `category-${painFields.fields.length + 1}`,
                    title: "New category",
                    bullets: ["Add a talking point"]
                  })
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Add category
              </Button>
            </div>
            {painFields.fields.map((field, i) => (
              <div key={field.id} className="space-y-3 rounded-md border p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Category ID</Label>
                    <Input className="min-h-11" {...form.register(`painPointsByCategory.${i}.categoryId`)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Title</Label>
                    <Input className="min-h-11" {...form.register(`painPointsByCategory.${i}.title`)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Bullets (one per line)</Label>
                  <Textarea
                    className="min-h-[6rem]"
                    value={(form.watch(`painPointsByCategory.${i}.bullets`) ?? []).join("\n")}
                    onChange={(e) => {
                      const bullets = e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      form.setValue(`painPointsByCategory.${i}.bullets`, bullets.length ? bullets : [""], {
                        shouldDirty: true
                      });
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11"
                  onClick={() => painFields.remove(i)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove category
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment methods</CardTitle>
            <p className="text-sm text-muted-foreground">
              Values reps share with clients when collecting advance and due payments.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {PAYMENT_SHARE_METHOD_KEYS.map((key, i) => (
              <div key={key} className="space-y-3 rounded-md border p-3">
                <p className="text-sm font-medium">{PAYMENT_SHARE_METHOD_LABELS[key]}</p>
                <div className="space-y-2">
                  <Label className="text-xs">
                    {key === "upi_id" ? "UPI ID" : key.includes("qr") ? "Label or note" : "Payment URL"}
                  </Label>
                  <Input
                    className="min-h-11"
                    placeholder={
                      key === "upi_id"
                        ? "business@upi"
                        : key.includes("qr")
                          ? "Optional caption for QR"
                          : "https://rzp.io/…"
                    }
                    {...form.register(`paymentShareMethods.${i}.shareValue`)}
                  />
                </div>
                {(key === "razorpay_qr" || key === "sbi_qr") && (
                  <p className="text-xs text-muted-foreground">
                    {key === "razorpay_qr"
                      ? "QR image is managed in code and shown to reps on Resources automatically."
                      : "SBI QR is not configured yet; add a code-owned asset in a future deploy."}
                  </p>
                )}
                <div className="space-y-2">
                  <Label className="text-xs">Instructions for reps (optional)</Label>
                  <Textarea
                    className="min-h-[4rem]"
                    placeholder="Short note shown when rep selects this method"
                    {...form.register(`paymentShareMethods.${i}.instructions`)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6 mt-0">
        <Collapsible defaultOpen={false}>
          <Card className="border-[#FF3333]">
            <CardHeader className="pb-2">
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 text-left">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#FF3333]" aria-hidden />
                  <CardTitle className="text-base">Advanced / emergency controls</CardTitle>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
              </CollapsibleTrigger>
              <p className="text-xs text-muted-foreground">
                Manual status overrides — normal deals use pipeline steps.
              </p>
            </CardHeader>
            <CollapsibleContent>
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-0">
            <CardTitle className="text-sm font-medium">Manual transitions</CardTitle>
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
                          {leadStatusLabel(s)}
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
                          {leadStatusLabel(s)}
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
                  variant="outline"
                  size="sm"
                  className="min-h-11 w-full gap-1.5 sm:w-auto sm:shrink-0"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                  Remove
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
            </CollapsibleContent>
          </Card>
        </Collapsible>

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
                        {leadStatusLabel(s)}
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
                  {leadStatusLabel(s)}
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
              <Label htmlFor="settings-payment-tolerance">Payment vs quote tolerance (%)</Label>
              <p className="text-xs text-muted-foreground">Leave empty to disable. Stored as basis points.</p>
              <Input
                id="settings-payment-tolerance"
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
              <Label htmlFor="settings-export-max-rows">Export max rows (100–500000)</Label>
              <Input
                id="settings-export-max-rows"
                type="number"
                className="min-h-11"
                {...form.register("exportMaxRows", { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>

        <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={patch.isPending}>
          Save settings
        </Button>
      </form>

      <SettingsExportsCard />
    </div>
  );
}
