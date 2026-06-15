import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { DealAmountField } from "../../components/pipeline/DealAmountField";
import { PaymentMethodField } from "../../components/pipeline/PaymentMethodField";
import { StageModalShell } from "../../components/pipeline/StageModalShell";
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
import { Skeleton } from "@/components/ui/skeleton";
import { DeclineFeedbackBanner } from "../../components/pipeline/DeclineFeedbackBanner";
import { DeclineFeedbackInline } from "../../components/pipeline/DeclineFeedbackBanner";
import { PipelineFocusCard } from "../../components/pipeline/PipelineFocusCard";
import { declineNoteForStage, findDeclineFeedbackStage } from "../../lib/declineFeedback";
import {
  StageModalVerifiedFooter,
  StageModalWaitingFooter
} from "../../components/pipeline/StageModalWaiting";
import { PortalLinkDisplay } from "../../components/ui/PortalLinkDisplay";
import { prepareAccountsReadyPatch } from "../../lib/githubAccount";
import { PortalMetaGrid } from "../../components/ui/PortalMetaGrid";
import {
  accountsReadyMetaItems,
  accountsReadyMissingGithubHint
} from "../../components/pipeline/accountsReadyMetaItems";
import {
  repPaymentWaitingDetail,
  pendingPaymentForKind
} from "../../components/pipeline/paymentSubmissionMetaItems";
import { PaymentSubmissionReviewSection } from "../../components/pipeline/PaymentSubmissionReviewSection";
import { SetProspectCategoryDialog } from "../../components/pipeline/SetProspectCategoryDialog";
import { DeleteLeadsDialog } from "../../components/pipeline/DeleteLeadsDialog";
import { NotInterestedArchiveBanner } from "../../components/pipeline/NotInterestedArchiveBanner";
import { InterestedSampleStatusCard } from "../../components/pipeline/InterestedSampleStatusCard";
import { ProspectCategoryTimeline } from "../../components/pipeline/ProspectCategoryTimeline";
import { ProspectCategoryBadge } from "../../components/pipeline/ProspectCategoryBadge";
import { RepDemoPreviewLink } from "../../components/pipeline/RepDemoPreviewLink";
import {
  canChangeProspectCategory,
  canDeleteLead,
  isProspectArchived,
  prospectCategoryLabel
} from "../../lib/leadProspectCategory";
import { PipelineStepsAccordion } from "../../components/pipeline/PipelineStepsAccordion";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import { MilestoneProgressCard } from "../../components/commission/MilestoneProgressCard";
import {
  errToast,
  useConvertLeadMutation,
  useCommissionsQuery,
  useLeadQuery,
  useMarkPaymentMutation,
  usePatchLeadMutation,
  usePortalSettingsQuery,
  usePatchProjectMutation,
  useWebsiteTemplatesQuery
} from "../../hooks/useSalesQueries";
import { usePaymentShareMethods } from "../../hooks/usePaymentShareMethods";
import { prepareHttpUrlForMutation } from "../../lib/httpUrl";
import { toastIfStageBlocked } from "../../lib/pipelineStageGuard";
import type { PaymentShareMethodKey, PipelineStageKey } from "../../types";
import {
  bpsToPercentLabel,
  formatMinorUnits,
  parseRupeeInputToCents,
  resolveDealSplitDisplay,
  splitAgreedTotalCents
} from "../../lib/money";
import { repPaymentMethodFromLead } from "../../lib/repPaymentMethod";
import {
  commissionBreakdownHint,
  formatPerformanceBonusSuffix,
  performanceBonusProgramHint
} from "../../lib/commissionEstimate";
import { formatTemplateOption } from "../../lib/templateLabel";
import { Badge } from "@/components/ui/badge";
import { leadStatusLabel } from "../../lib/copy";
import { IndianMobileField } from "../../components/IndianMobileField";
import { isValidIndianMobile, normalizeIndianMobileInput } from "../../lib/indianMobilePhone";
import {
  isRepAdminLockedVerified,
  repConvertDealModalMode,
  repConvertDealTermsReadOnly,
  repStageModalReadOnly,
  repStageModalTitle
} from "../../lib/stageLockUi";
import { WebsiteTemplateField } from "../../components/pipeline/WebsiteTemplateField";

export function PipelineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const leadQr = useLeadQuery(id);
  const settingsQr = usePortalSettingsQuery();
  const isModelBRep = settingsQr.data?.settings.commissionModel === "MODEL_B";
  const commissionsQr = useCommissionsQuery({
    page: 1,
    pageSize: 1,
    enabled: isModelBRep
  });
  const tplQr = useWebsiteTemplatesQuery(true);

  const [activeStage, setActiveStage] = useState<PipelineStageKey | null>(null);

  const patch = usePatchLeadMutation(id ?? "");
  const convert = useConvertLeadMutation(id ?? "");
  const markPay = useMarkPaymentMutation(id ?? "");
  const patchProject = usePatchProjectMutation(id);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [agreedRupees, setAgreedRupees] = useState("");
  const [paymentMethodKey, setPaymentMethodKey] = useState<PaymentShareMethodKey | "">("");
  const [finalPaymentMethodKey, setFinalPaymentMethodKey] = useState<PaymentShareMethodKey | "">("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [deployUrl, setDeployUrl] = useState("");
  const [clientGithubId, setClientGithubId] = useState("");
  const [clientGithubEmail, setClientGithubEmail] = useState("");
  const [accountsGithubError, setAccountsGithubError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    setActiveStage(null);
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setNotes("");
    setTemplateId("");
    setAgreedRupees("");
    setPaymentMethodKey("");
    setFinalPaymentMethodKey("");
    setWhatsappLink("");
    setDeployUrl("");
    setClientGithubId("");
    setClientGithubEmail("");
    setAccountsGithubError(null);
  }, [id]);

  const loading = leadQr.isLoading || (settingsQr.isLoading && !settingsQr.isError);
  const lead = leadQr.data?.lead;
  const stages = leadQr.data?.pipelineStages ?? [];
  const declineFeedback = findDeclineFeedbackStage(stages);
  const settings = settingsQr.data?.settings;
  const advanceShareBps = settings?.advancePaymentShareBps ?? 5000;
  const paymentShareMethods = usePaymentShareMethods();
  const commissionHint =
    lead && settings && !isModelBRep ? commissionBreakdownHint(lead, settings) : null;
  const performanceBonusHint =
    settings && !isModelBRep ? performanceBonusProgramHint(settings) : null;
  const milestone = commissionsQr.data?.summary?.milestone;
  const agreedTotalCents = parseRupeeInputToCents(agreedRupees);
  const convertSplit = useMemo(() => {
    if (lead?.convertedAt) return null;
    if (agreedTotalCents == null || agreedTotalCents <= 0) return null;
    return splitAgreedTotalCents(agreedTotalCents, advanceShareBps);
  }, [lead?.convertedAt, agreedTotalCents, advanceShareBps]);
  const dealSplitDisplay = useMemo(
    () =>
      lead
        ? resolveDealSplitDisplay(lead, convertSplit)
        : { advanceCents: null, dueCents: null, fromServer: false },
    [lead, convertSplit]
  );

  const activeStageView = useMemo(
    () => (activeStage ? stages.find((s) => s.key === activeStage) : undefined),
    [activeStage, stages]
  );

  const readOnlyModal = useMemo(
    () =>
      lead && activeStage != null
        ? repStageModalReadOnly(activeStageView, activeStage, lead)
        : false,
    [activeStage, activeStageView, lead]
  );

  const readOnlyStageFooter = useMemo(() => {
    if (!activeStage) return null;
    return activeStageView?.state === "verified" ? (
      <StageModalVerifiedFooter />
    ) : (
      <StageModalWaitingFooter />
    );
  }, [activeStage, activeStageView?.state]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (leadQr.isError || !lead) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <QueryErrorAlert
          message="Could not load this record."
          onRetry={() => void leadQr.refetch()}
        />
        <Button asChild variant="link">
          <Link to="/portal/pipeline">Back to pipeline</Link>
        </Button>
      </div>
    );
  }

  if (!lead.convertedAt && isProspectArchived(lead)) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" className="min-h-11 w-fit -ml-2" asChild>
          <Link to="/portal/pipeline?view=leads&prospectCategory=NOT_INTERESTED">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Not interested
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">{lead.clientName}</h1>
          <p className="text-sm text-muted-foreground">Archived prospect</p>
        </div>
        <NotInterestedArchiveBanner
          lead={lead}
          onRestored={() => {
            void leadQr.refetch();
          }}
        />
        {canDeleteLead(lead) ? (
          <DeleteLeadsDialog
            leadIds={[lead.id]}
            clientNames={[lead.clientName]}
            variant="destructive"
            triggerLabel="Delete prospect"
            onDeleted={() =>
              navigate("/portal/pipeline?view=leads&prospectCategory=NOT_INTERESTED")
            }
          />
        ) : null}
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wide">Category history</h2>
          <ProspectCategoryTimeline leadId={lead.id} />
        </section>
        <PortalMetaGrid
          items={[
            { label: "Phone", value: lead.clientPhone ?? "—" },
            { label: "Email", value: lead.clientEmail ?? "—" },
            { label: "Notes", value: lead.notes?.trim() || "—" }
          ]}
        />
      </div>
    );
  }

  const closeModal = () => {
    setActiveStage(null);
  };

  const demoPreviewUrl = lead.project?.previewUrl?.trim() || null;

  const handleStageClick = (key: PipelineStageKey) => {
    if (!lead) return;
    if (toastIfStageBlocked(stages, key)) return;

    if (key === "lead_capture") {
      setClientName(lead.clientName);
      setClientPhone(lead.clientPhone ?? "");
      setClientEmail(lead.clientEmail ?? "");
      setNotes(lead.notes ?? "");
      setPhoneError(null);
      setEmailError(null);
    }
    if (key === "convert_deal") {
      setTemplateId(lead.websiteTemplateId ?? "");
      setAgreedRupees(
        lead.agreedTotalCents ? String(lead.agreedTotalCents / 100) : ""
      );
      setPaymentMethodKey(repPaymentMethodFromLead(lead, "ADVANCE"));
    }
    if (key === "whatsapp_group") {
      setWhatsappLink(lead.whatsappGroupLink ?? "");
    }
    if (key === "final_payment") {
      setFinalPaymentMethodKey(repPaymentMethodFromLead(lead, "FINAL"));
    }
    if (key === "deployment_submit") {
      setDeployUrl(lead.project?.deployedUrl ?? "");
    }
    if (key === "accounts_ready") {
      setClientGithubId(lead.clientGithubId ?? "");
      setClientGithubEmail(lead.clientGithubEmail ?? "");
      setAccountsGithubError(null);
    }
    setActiveStage(key);
  };

  const minRupees = settings ? settings.minAgreedTotalCents / 100 : 7999;

  const canSubmitConvert =
    !readOnlyModal &&
    !!templateId &&
    agreedTotalCents != null &&
    agreedTotalCents >= (settings?.minAgreedTotalCents ?? 799_900) &&
    !!paymentMethodKey;

  const canSubmitFinal =
    !readOnlyModal &&
    lead.finalQuoteCents != null &&
    lead.finalQuoteCents > 0 &&
    !!finalPaymentMethodKey;

  const canSubmitAccountsReady =
    !readOnlyModal &&
    clientGithubId.trim().length > 0 &&
    clientGithubEmail.trim().length > 0;

  const templateLabel = lead.websiteTemplate
    ? formatTemplateOption(lead.websiteTemplate)
    : null;

  const repWaitingDetail = repPaymentWaitingDetail(
    stages.find((s) => s.state === "pending_admin" && s.repActor)?.key,
    lead
  );

  const pendingFinalPayment = pendingPaymentForKind(lead, "FINAL");
  const pendingAdvancePayment = pendingPaymentForKind(lead, "ADVANCE");

  const convertDealMode = lead ? repConvertDealModalMode(lead) : "pre_convert";
  const convertTermsReadOnly = lead ? repConvertDealTermsReadOnly(lead) : false;
  const templateDirty =
    !!lead && !!templateId && templateId !== (lead.websiteTemplateId ?? "");
  const canSaveTemplate =
    convertDealMode === "post_convert_editable" && templateDirty && !patch.isPending;

  const activeModalTitle =
    activeStage != null
      ? repStageModalTitle(activeStage, readOnlyModal, activeStageView, lead)
      : "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Button variant="ghost" className="min-h-11 w-fit -ml-2" asChild>
          <Link to="/portal/pipeline">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back
          </Link>
        </Button>
        <DataStaleToolbar
          dataUpdatedAt={leadQr.dataUpdatedAt}
          onRefresh={() => {
            void leadQr.refetch();
            void settingsQr.refetch();
          }}
          isFetching={leadQr.isFetching}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold md:text-2xl">{lead.clientName}</h1>
          <p className="text-sm text-muted-foreground">
            {lead.convertedAt ? "Client" : "Lead"} · {leadStatusLabel(lead.status)}
          </p>
          {!lead.convertedAt ? (
            <p className="text-sm">
              Category: <span className="font-semibold">{prospectCategoryLabel(lead.prospectCategory)}</span>
            </p>
          ) : null}
          {!lead.convertedAt ? <ProspectCategoryBadge lead={lead} /> : null}
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          {!lead.convertedAt && canChangeProspectCategory(lead) ? (
            <SetProspectCategoryDialog
              leadId={lead.id}
              clientName={lead.clientName}
              lead={lead}
              triggerLabel="Change category"
              onUpdated={() => void leadQr.refetch()}
            />
          ) : lead.convertedAt ? (
            <p className="text-xs text-muted-foreground">Converted clients use the pipeline stages below.</p>
          ) : null}
          {!lead.convertedAt && canDeleteLead(lead) ? (
            <DeleteLeadsDialog
              leadIds={[lead.id]}
              clientNames={[lead.clientName]}
              variant="destructive"
              triggerLabel="Delete prospect"
              onDeleted={() => navigate("/portal/pipeline?view=leads&prospectCategory=NEW_LEAD")}
            />
          ) : null}
        </div>
      </div>

      {!lead.convertedAt ? (
        <>
          <InterestedSampleStatusCard lead={lead} onUpdated={() => void leadQr.refetch()} />
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wide">Category history</h2>
            <ProspectCategoryTimeline leadId={lead.id} />
          </section>
        </>
      ) : null}

      {settingsQr.isError ? (
        <QueryErrorAlert
          message="Could not load portal settings. Using default minimums."
          onRetry={() => void settingsQr.refetch()}
        />
      ) : null}

      {declineFeedback ? (
        <DeclineFeedbackBanner
          stageTitle={declineFeedback.title}
          declineNote={declineFeedback.declineNote ?? null}
        />
      ) : null}

      <PipelineFocusCard
        stages={stages}
        actorMode="rep"
        onPrimaryAction={handleStageClick}
        onViewSubmission={handleStageClick}
        waitingDetail={repWaitingDetail}
      />

      <PipelineStepsAccordion
        stages={stages}
        actorMode="rep"
        onStageClick={handleStageClick}
        repPreviewUrl={demoPreviewUrl}
      />

      {isModelBRep && milestone ? (
        <div className="space-y-2">
          <MilestoneProgressCard milestone={milestone} />
          {!lead.commission ? (
            <p className="text-xs text-muted-foreground px-1">{milestone.nextPayoutHint}</p>
          ) : null}
        </div>
      ) : null}

      {lead.commission && (
        <div className="rounded-lg border p-4 text-sm space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">
              {isModelBRep ? "Payout" : "Commission"}: {formatMinorUnits(lead.commission.amountCents)}
              {!isModelBRep
                ? formatPerformanceBonusSuffix(lead.commission.bonusCents, settings)
                : null}
            </p>
            <Badge variant={lead.commission.isPaid ? "default" : "secondary"}>
              {lead.commission.isPaid ? "Paid" : "Pending payout"}
            </Badge>
          </div>
          {commissionHint ? (
            <p className="text-xs text-muted-foreground">{commissionHint}</p>
          ) : null}
          {!lead.commission.isPaid && performanceBonusHint ? (
            <p className="text-xs text-muted-foreground">{performanceBonusHint}</p>
          ) : null}
          <Button variant="link" className="h-auto min-h-11 px-0 text-sm" asChild>
            <Link to="/portal/commission">
              {isModelBRep ? "View all payouts" : "View all commission"}
            </Link>
          </Button>
        </div>
      )}

      <StageModalShell
        open={activeStage === "lead_capture"}
        onOpenChange={(o) => !o && closeModal()}
        title={activeStage === "lead_capture" ? activeModalTitle : "Lead details"}
        description={
          activeStageView?.state === "pending_admin" && activeStage === "lead_capture"
            ? "Admin must verify these details before they are locked again."
            : activeStageView && isRepAdminLockedVerified(activeStageView)
              ? "Ask admin to decline this step if you need to change approved details."
              : undefined
        }
        footer={
          readOnlyModal ? (
            readOnlyStageFooter
          ) : (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={patch.isPending}
              onClick={() => {
                const digits = normalizeIndianMobileInput(clientPhone);
                if (digits.length > 0 && !isValidIndianMobile(digits)) {
                  setPhoneError("Enter a valid 10-digit mobile number.");
                  return;
                }
                const emailTrim = clientEmail.trim();
                if (emailTrim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
                  setEmailError("Enter a valid email address.");
                  return;
                }
                setPhoneError(null);
                setEmailError(null);
                patch.mutate(
                  {
                    clientName: clientName.trim(),
                    clientEmail: emailTrim || null,
                    clientPhone: digits || null,
                    notes: notes.trim() || null
                  },
                  { onSuccess: closeModal }
                );
              }}
            >
              {lead.convertedAt ? "Submit for admin review" : "Save"}
            </Button>
          )
        }
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              className="min-h-11"
              value={clientName}
              disabled={readOnlyModal}
              readOnly={readOnlyModal}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email (optional)</Label>
            <Input
              id="edit-email"
              className="min-h-11"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={clientEmail}
              disabled={readOnlyModal}
              readOnly={readOnlyModal}
              aria-invalid={!!emailError}
              onChange={(e) => {
                setClientEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
            />
            {emailError ? (
              <p className="text-xs text-destructive" role="alert">
                {emailError}
              </p>
            ) : null}
          </div>
          <IndianMobileField
            id="edit-phone"
            label="Mobile number"
            value={clientPhone}
            disabled={readOnlyModal}
            onChange={(v) => {
              setClientPhone(v);
              if (phoneError) setPhoneError(null);
            }}
            error={phoneError ?? undefined}
          />
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              disabled={readOnlyModal}
              readOnly={readOnlyModal}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "convert_deal"}
        onOpenChange={(o) => !o && closeModal()}
        title={activeStage === "convert_deal" ? activeModalTitle : "Convert to client"}
        footer={
          convertDealMode === "post_convert_editable" ? (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={!canSaveTemplate}
              onClick={() => {
                if (!templateId || templateId === lead.websiteTemplateId) return;
                patch.mutate(
                  { websiteTemplateId: templateId },
                  {
                    onSuccess: () => {
                      toast.success("Template updated. Admins were notified.");
                      closeModal();
                    }
                  }
                );
              }}
            >
              Save template
            </Button>
          ) : readOnlyModal ? (
            readOnlyStageFooter
          ) : (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={convert.isPending || !canSubmitConvert}
              onClick={() => {
                if (agreedTotalCents == null || !paymentMethodKey) return;
                convert.mutate(
                  {
                    websiteTemplateId: templateId,
                    agreedTotalCents,
                    repNote: paymentMethodKey
                  },
                  { onSuccess: closeModal }
                );
              }}
            >
              Submit for admin approval
            </Button>
          )
        }
      >
        {(() => {
          const note = declineNoteForStage(stages, "convert_deal");
          return note !== undefined ? (
            <DeclineFeedbackInline declineNote={note} className="mb-3" />
          ) : null;
        })()}
        {convertDealMode === "post_convert_editable" ? (
          <p className="mb-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
            You can change the website template until the WhatsApp group is verified. Deal amount and
            payment method stay locked.
          </p>
        ) : null}
        <div className="space-y-3">
          <WebsiteTemplateField
            templates={tplQr.data?.items ?? []}
            value={templateId}
            onChange={convertDealMode === "post_convert_locked" ? undefined : setTemplateId}
            mode={
              convertDealMode === "pre_convert"
                ? templateId
                  ? "selected"
                  : "picker"
                : convertDealMode === "post_convert_editable"
                  ? "selected"
                  : "readonly"
            }
            disabled={convertDealMode === "post_convert_locked"}
            lockedReason={
              convertDealMode === "post_convert_locked"
                ? "Locked after WhatsApp group was verified."
                : null
            }
            catalogUrl={settings?.templatesCatalogUrl ?? null}
          />
          {!convertTermsReadOnly ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="agreed">Agreed total (₹)</Label>
                <Input
                  id="agreed"
                  className="min-h-11"
                  inputMode="decimal"
                  value={agreedRupees}
                  onChange={(e) => setAgreedRupees(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Min ₹{minRupees}.</p>
              </div>
              <DealAmountField
                id="advance-preview"
                label={`Advance payment (${bpsToPercentLabel(advanceShareBps)})`}
                amountCents={dealSplitDisplay.advanceCents}
                hint={
                  dealSplitDisplay.dueCents != null
                    ? `Due after build: ${formatMinorUnits(dealSplitDisplay.dueCents)}${
                        dealSplitDisplay.fromServer
                          ? " · from agreed deal at convert"
                          : " · updates as you type agreed total"
                      }`
                    : dealSplitDisplay.fromServer
                      ? "From agreed deal at convert"
                      : undefined
                }
              />
              <PaymentMethodField
                id="convert-payment-method"
                value={paymentMethodKey}
                onChange={setPaymentMethodKey}
                methods={paymentShareMethods}
              />
            </>
          ) : (
            <>
              {templateLabel ? (
                <PortalMetaGrid
                  items={[
                    {
                      label: "Template on file",
                      value: templateLabel
                    },
                    {
                      label: "Agreed total",
                      value:
                        lead.agreedTotalCents != null
                          ? formatMinorUnits(lead.agreedTotalCents)
                          : "—"
                    },
                    {
                      label: "Advance",
                      value:
                        lead.advanceAmountCents != null
                          ? formatMinorUnits(lead.advanceAmountCents)
                          : "—"
                    }
                  ]}
                />
              ) : null}
              <DealAmountField
                id="advance-preview"
                label={`Advance payment (${bpsToPercentLabel(advanceShareBps)})`}
                amountCents={dealSplitDisplay.advanceCents}
                hint={
                  dealSplitDisplay.dueCents != null
                    ? `Due after build: ${formatMinorUnits(dealSplitDisplay.dueCents)} · from agreed deal at convert`
                    : "From agreed deal at convert"
                }
              />
              {convertTermsReadOnly && pendingAdvancePayment ? (
                <div className="min-w-0 space-y-3 border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Advance payment submitted</p>
                  <PaymentSubmissionReviewSection
                    lead={lead}
                    payment={pendingAdvancePayment}
                    methods={paymentShareMethods}
                    options={{
                      includeDealContext: true,
                      templateLabel,
                      websiteTemplate: lead.websiteTemplate ?? undefined
                    }}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "whatsapp_group"}
        onOpenChange={(o) => !o && closeModal()}
        title={activeStage === "whatsapp_group" ? activeModalTitle : "WhatsApp group"}
        description={
          readOnlyModal &&
          activeStage === "whatsapp_group" &&
          activeStageView &&
          isRepAdminLockedVerified(activeStageView)
            ? "This link was approved by admin."
            : undefined
        }
        footer={
          readOnlyModal ? (
            readOnlyStageFooter
          ) : (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={patch.isPending}
              onClick={() => {
                try {
                  const whatsappGroupLink = prepareHttpUrlForMutation(whatsappLink);
                  patch.mutate({ whatsappGroupLink }, { onSuccess: closeModal });
                } catch (e) {
                  errToast(e);
                }
              }}
            >
              Save link
            </Button>
          )
        }
      >
        {(() => {
          const note = declineNoteForStage(stages, "whatsapp_group");
          return note !== undefined ? (
            <DeclineFeedbackInline declineNote={note} className="mb-3" />
          ) : null;
        })()}
        <div className="space-y-2">
          <Label htmlFor="wa-link">Group invite link</Label>
          <p className="text-xs text-muted-foreground">Invite link for client + technical team.</p>
          {readOnlyModal ? (
            <PortalLinkDisplay url={whatsappLink} copyLabel="Group link" />
          ) : (
            <Input
              id="wa-link"
              className="min-h-11"
              type="url"
              inputMode="url"
              placeholder="https://chat.whatsapp.com/…"
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
            />
          )}
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "build_demo"}
        onOpenChange={(o) => !o && closeModal()}
        title="Demo preview link"
        footer={
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 w-full sm:w-auto"
            onClick={closeModal}
          >
            Close
          </Button>
        }
      >
        <RepDemoPreviewLink previewUrl={demoPreviewUrl} context="building" />
      </StageModalShell>

      <StageModalShell
        open={activeStage === "demo_finalized"}
        onOpenChange={(o) => !o && closeModal()}
        title="Demo approved"
        footer={
          readOnlyModal ? (
            readOnlyStageFooter
          ) : (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={patch.isPending || !demoPreviewUrl}
              onClick={() => patch.mutate({ markDemoFinalized: true }, { onSuccess: closeModal })}
            >
              Mark demo finalized
            </Button>
          )
        }
      >
        {(() => {
          const note = declineNoteForStage(stages, "demo_finalized");
          return note !== undefined ? (
            <DeclineFeedbackInline declineNote={note} className="mb-3" />
          ) : null;
        })()}
        <div className="space-y-3">
          <RepDemoPreviewLink
            previewUrl={demoPreviewUrl}
            context={readOnlyModal ? "submitted" : "approve"}
          />
          <p className="text-xs text-muted-foreground">Client signed off on the demo.</p>
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "accounts_ready"}
        onOpenChange={(o) => !o && closeModal()}
        title="Accounts ready"
        footer={
          readOnlyModal ? (
            readOnlyStageFooter
          ) : (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={patch.isPending || !canSubmitAccountsReady}
              onClick={() => {
                try {
                  setAccountsGithubError(null);
                  const body = prepareAccountsReadyPatch(clientGithubId, clientGithubEmail);
                  patch.mutate(body, { onSuccess: closeModal });
                } catch (e) {
                  const msg =
                    e instanceof Error
                      ? e.message
                      : "Enter a valid GitHub username and email.";
                  setAccountsGithubError(msg);
                  errToast(e);
                }
              }}
            >
              Mark accounts ready
            </Button>
          )
        }
      >
        {(() => {
          const note = declineNoteForStage(stages, "accounts_ready");
          return note !== undefined ? (
            <DeclineFeedbackInline declineNote={note} className="mb-3" />
          ) : null;
        })()}
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            GitHub + static hosting for the client. Add the account details admin will verify.
          </p>
          {readOnlyModal ? (
            <>
              <PortalMetaGrid items={accountsReadyMetaItems(lead)} />
              {accountsReadyMissingGithubHint(lead) ? (
                <p className="text-xs portal-waiting-text" role="status">
                  GitHub details were not saved with this submission — contact admin if this looks
                  wrong.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="client-github-id">GitHub username</Label>
                <p className="text-xs text-muted-foreground">
                  Client&apos;s GitHub ID (username), not your personal account.
                </p>
                <Input
                  id="client-github-id"
                  className="min-h-11"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="e.g. acme-corp"
                  value={clientGithubId}
                  onChange={(e) => {
                    setClientGithubId(e.target.value);
                    if (accountsGithubError) setAccountsGithubError(null);
                  }}
                  aria-invalid={!!accountsGithubError}
                  aria-describedby={
                    accountsGithubError ? "accounts-github-error" : "accounts-github-id-hint"
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-github-email">GitHub account email</Label>
                <p id="accounts-github-id-hint" className="text-xs text-muted-foreground">
                  Email used when the client&apos;s GitHub account was created.
                </p>
                <Input
                  id="client-github-email"
                  className="min-h-11"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="client@example.com"
                  value={clientGithubEmail}
                  onChange={(e) => {
                    setClientGithubEmail(e.target.value);
                    if (accountsGithubError) setAccountsGithubError(null);
                  }}
                  aria-invalid={!!accountsGithubError}
                  aria-describedby={
                    accountsGithubError ? "accounts-github-error" : undefined
                  }
                />
              </div>
              {accountsGithubError ? (
                <p id="accounts-github-error" className="text-xs text-destructive" role="alert">
                  {accountsGithubError}
                </p>
              ) : null}
            </>
          )}
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "final_payment"}
        onOpenChange={(o) => !o && closeModal()}
        title="Due payment"
        footer={
          readOnlyModal ? (
            readOnlyStageFooter
          ) : (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={markPay.isPending || !canSubmitFinal}
              onClick={() => {
                const amountCents = lead.finalQuoteCents;
                if (amountCents == null || amountCents <= 0 || !finalPaymentMethodKey) return;
                markPay.mutate(
                  { kind: "FINAL", amountCents, repNote: finalPaymentMethodKey },
                  { onSuccess: closeModal }
                );
              }}
            >
              Record due payment
            </Button>
          )
        }
      >
        {(() => {
          const note = declineNoteForStage(stages, "final_payment");
          return note !== undefined ? (
            <DeclineFeedbackInline declineNote={note} className="mb-3" />
          ) : null;
        })()}
        <div className="space-y-3">
          {readOnlyModal && pendingFinalPayment ? (
            <PaymentSubmissionReviewSection
              lead={lead}
              payment={pendingFinalPayment}
              methods={paymentShareMethods}
              options={{ templateLabel }}
            />
          ) : readOnlyModal ? (
            <p className="text-xs portal-waiting-text" role="status">
              Payment details are not on file yet — refresh or contact admin if this looks wrong.
            </p>
          ) : (
            <>
              <DealAmountField
                id="due"
                label="Due amount"
                amountCents={lead.finalQuoteCents}
                hint="Calculated from agreed total at convert — you cannot edit this."
                missingMessage="Due amount is missing on this deal. Ask admin to confirm the convert step saved correctly."
              />
              <PaymentMethodField
                id="final-payment-method"
                value={finalPaymentMethodKey}
                onChange={setFinalPaymentMethodKey}
                methods={paymentShareMethods}
              />
            </>
          )}
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "deployment_submit"}
        onOpenChange={(o) => !o && closeModal()}
        title="Live deployment"
        footer={
          readOnlyModal ? (
            readOnlyStageFooter
          ) : (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={patchProject.isPending || !lead.project?.id}
              onClick={() => {
                const projectId = lead.project?.id;
                if (!projectId) return;
                try {
                  const deployedUrl = prepareHttpUrlForMutation(deployUrl);
                  patchProject.mutate(
                    {
                      projectId,
                      body: { deployedUrl, markDeploymentSubmitted: true }
                    },
                    { onSuccess: closeModal }
                  );
                } catch (e) {
                  errToast(e);
                }
              }}
            >
              Submit for verification
            </Button>
          )
        }
      >
        {(() => {
          const note = declineNoteForStage(stages, "deployment_submit");
          return note !== undefined ? (
            <DeclineFeedbackInline declineNote={note} className="mb-3" />
          ) : null;
        })()}
        {!lead.project?.id ? (
          <p className="mb-2 text-xs portal-waiting-text">
            Available after admin verifies advance payment.
          </p>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="live-url">Live site URL</Label>
          {readOnlyModal ? (
            <PortalLinkDisplay url={deployUrl} copyLabel="Live URL" />
          ) : (
            <Input
              id="live-url"
              className="min-h-11"
              type="url"
              inputMode="url"
              placeholder="https://… or yourdomain.com"
              value={deployUrl}
              onChange={(e) => setDeployUrl(e.target.value)}
            />
          )}
        </div>
      </StageModalShell>

    </div>
  );
}
