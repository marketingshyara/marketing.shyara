import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AdminVerifyModals } from "../../components/pipeline/AdminVerifyModals";
import { PaymentVerifyDialog } from "../../components/pipeline/PaymentVerifyDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DeclineFeedbackBanner } from "../../components/pipeline/DeclineFeedbackBanner";
import { NotInterestedArchiveBanner } from "../../components/pipeline/NotInterestedArchiveBanner";
import { ProspectCategoryTimeline } from "../../components/pipeline/ProspectCategoryTimeline";
import { InterestedSampleStatusCard } from "../../components/pipeline/InterestedSampleStatusCard";
import { ProspectCategoryBadge } from "../../components/pipeline/ProspectCategoryBadge";
import { SetProspectCategoryDialog } from "../../components/pipeline/SetProspectCategoryDialog";
import {
  canChangeProspectCategory,
  prospectCategoryLabel
} from "../../lib/leadProspectCategory";
import { PortalMetaGrid } from "../../components/ui/PortalMetaGrid";
import { PipelineFocusCard } from "../../components/pipeline/PipelineFocusCard";
import { findDeclineFeedbackStage } from "../../lib/declineFeedback";
import { PipelineStepsAccordion } from "../../components/pipeline/PipelineStepsAccordion";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MilestoneProgressCard } from "../../components/commission/MilestoneProgressCard";
import {
  errToast,
  useLeadQuery,
  useMarkCommissionPaidMutation,
  useMilestonePayoutMutation,
  usePatchLeadMutation,
  useRejectLeadStageMutation,
  useTeamRepQuery,
  useTeamRepsQuery,
  useVerifyLeadStageMutation,
  useAdminSettingsQuery,
  useVerifyPaymentMutation
} from "../../hooks/useSalesQueries";
import {
  formatPerformanceBonusSuffix,
  performanceBonusPayoutHint
} from "../../lib/commissionEstimate";
import { usePaymentShareMethods } from "../../hooks/usePaymentShareMethods";
import { prepareHttpUrlForMutation, tryNormalizeHttpUrl } from "../../lib/httpUrl";
import { prepareGithubRepoUrlForMutation } from "../../lib/githubRepoUrl";
import type {
  Lead,
  LeadPayment,
  PipelineStageKey,
  PipelineStageVerifyKey,
  PipelineStageView
} from "../../types";
import { formatMinorUnits } from "../../lib/money";
import { paymentReferenceFieldCopy } from "../../lib/paymentShareMethods";
import { leadStatusLabel, modelBMilestoneDealHeadline, modelBMilestonePaidToast, modelBMilestonePayCta } from "../../lib/copy";
import { formatTemplateOption } from "../../lib/templateLabel";
import { toastIfStageBlocked } from "../../lib/pipelineStageGuard";
import { getPipelineFocus } from "../../lib/pipelineCopy";
import { adminCanOpenStageModal } from "../../lib/adminPipelineStageClick";
import { toast } from "sonner";

const STAGE_TO_VERIFY: Partial<Record<PipelineStageKey, PipelineStageVerifyKey>> = {
  lead_capture: "client_details",
  whatsapp_group: "whatsapp",
  demo_finalized: "demo_finalized",
  build_demo: "preview_ready",
  accounts_ready: "accounts_ready",
  repo_transfer: "repo_transfer",
  deployment_verify: "deployment"
};

const STAGE_REJECTABLE: Partial<Record<PipelineStageKey, PipelineStageVerifyKey>> = {
  lead_capture: "client_details",
  whatsapp_group: "whatsapp",
  demo_finalized: "demo_finalized",
  accounts_ready: "accounts_ready",
  deployment_verify: "deployment"
};

function AdminCommissionSummary({
  lead,
  isModelBRep
}: {
  lead: Lead;
  isModelBRep: boolean;
}) {
  const settingsQr = useAdminSettingsQuery(Boolean(lead.commission) && !isModelBRep);
  const portalSettings = settingsQr.data?.settings;
  const commission = lead.commission!;

  return (
    <div className="rounded-lg border p-4 text-sm space-y-2">
      <p>
        {isModelBRep ? "Payout" : "Commission"}: {formatMinorUnits(commission.amountCents)}
        {!isModelBRep
          ? formatPerformanceBonusSuffix(commission.bonusCents, portalSettings)
          : null}
      </p>
      {!isModelBRep && portalSettings && !commission.isPaid ? (
        <p className="text-xs text-muted-foreground" role="status">
          {performanceBonusPayoutHint(lead, portalSettings)}
        </p>
      ) : null}
      {isModelBRep ? (
        <p className="text-xs text-muted-foreground">Fixed per-deal payout</p>
      ) : null}
      <p className="text-muted-foreground">
        {commission.isPaid
          ? "Paid"
          : isModelBRep
            ? "Pending payout after you verify deployment"
            : "Pending payout after you verify deployment"}
      </p>
    </div>
  );
}

export function AdminProjectPage() {
  const { repId, leadId } = useParams<{ repId: string; leadId: string }>();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const leadQr = useLeadQuery(leadId);
  const repsQr = useTeamRepsQuery(true);
  const teamRepQr = useTeamRepQuery(repId, !!repId, "all");
  const [activeStage, setActiveStage] = useState<PipelineStageKey | null>(null);
  const [verifyPayment, setVerifyPayment] = useState<LeadPayment | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [declineNote, setDeclineNote] = useState("");
  const [previewUrlError, setPreviewUrlError] = useState<string | null>(null);
  const [transferredGithubRepoUrl, setTransferredGithubRepoUrl] = useState("");
  const [transferredGithubRepoUrlError, setTransferredGithubRepoUrlError] = useState<string | null>(
    null
  );

  const verifyPay = useVerifyPaymentMutation(leadId ?? "", repId);
  const verifyStage = useVerifyLeadStageMutation(leadId ?? "", repId);
  const rejectStage = useRejectLeadStageMutation(leadId ?? "", repId);
  const markCommissionPaid = useMarkCommissionPaidMutation(leadId ?? "", repId);
  const milestonePayout = useMilestonePayoutMutation(leadId ?? "", repId);
  const patch = usePatchLeadMutation(leadId ?? "", repId);

  const repSummary = teamRepQr.data?.rep;
  const isModelBRep = repSummary?.commissionModel === "MODEL_B";
  const milestoneReadyForLead =
    isModelBRep && repSummary?.milestone?.milestoneReadyLeadId === leadId;

  const lead = leadQr.data?.lead;
  const stages = leadQr.data?.pipelineStages ?? [];
  const paymentShareMethods = usePaymentShareMethods(!!lead);

  const closeModal = () => {
    setActiveStage(null);
    setDeclineNote("");
    setTransferredGithubRepoUrlError(null);
  };

  useEffect(() => {
    setActiveStage(null);
    setVerifyPayment(null);
    setDeclineNote("");
    setPreviewUrl("");
    setTransferredGithubRepoUrl("");
    setTransferredGithubRepoUrlError(null);
  }, [leadId]);

  useEffect(() => {
    const stage = searchParams.get("stage") as PipelineStageKey | null;
    if (stage && lead) {
      handleStageClick(stage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once when deep-linked
  }, [searchParams.get("stage"), lead?.id]);

  useEffect(() => {
    setPreviewUrl(lead?.project?.previewUrl ?? "");
  }, [lead?.project?.previewUrl]);

  const pendingAdvance = lead?.payments?.find(
    (p) => p.kind === "ADVANCE" && p.verificationStatus === "PENDING"
  );
  const pendingFinal = lead?.payments?.find(
    (p) => p.kind === "FINAL" && p.verificationStatus === "PENDING"
  );

  const handleStageClick = (key: PipelineStageKey) => {
    if (!lead) return;
    if (toastIfStageBlocked(stages, key)) return;
    if (key === "advance_verify") {
      if (pendingAdvance) {
        setVerifyPayment(pendingAdvance);
        return;
      }
      const verifiedAdvancePayment = lead.payments?.find(
        (p) => p.kind === "ADVANCE" && p.verificationStatus === "VERIFIED"
      );
      if (verifiedAdvancePayment) {
        setVerifyPayment(verifiedAdvancePayment);
        return;
      }
      const advStage = stages.find((s) => s.key === "advance_verify");
      if (advStage?.state === "actionable" || advStage?.state === "pending_admin") {
        toast.error("No pending advance payment found. Refresh the page.");
      }
      return;
    }
    if (key === "final_verify") {
      if (pendingFinal) {
        setVerifyPayment(pendingFinal);
        return;
      }
      const verifiedFinalPayment = lead.payments?.find(
        (p) => p.kind === "FINAL" && p.verificationStatus === "VERIFIED"
      );
      if (verifiedFinalPayment) {
        setVerifyPayment(verifiedFinalPayment);
        return;
      }
      const finStage = stages.find((s) => s.key === "final_verify");
      if (finStage?.state === "actionable" || finStage?.state === "pending_admin") {
        toast.error("No pending due payment found. Refresh the page.");
      }
      return;
    }
    if (key === "build_demo") {
      setPreviewUrl(lead.project?.previewUrl ?? "");
    }
    if (key === "convert_deal" && lead.convertedAt) {
      setActiveStage("convert_deal");
      return;
    }
    if (key === "deployment_submit") {
      if (!lead.project?.deploymentSubmittedAt) {
        return;
      }
      setActiveStage("deployment_submit");
      return;
    }
    const stage = stages.find((s) => s.key === key);
    if (!stage) return;
    if (key === "commission") {
      setActiveStage(key);
      return;
    }
    if (adminCanOpenStageModal(stage)) {
      if (key === "repo_transfer") {
        setTransferredGithubRepoUrl(lead.transferredGithubRepoUrl ?? "");
        setTransferredGithubRepoUrlError(null);
      }
      setActiveStage(key);
    }
  };

  const runStageVerify = (stageKey: PipelineStageVerifyKey) => {
    verifyStage.mutate(stageKey, {
      meta: { skipSuccessToast: true },
      onSuccess: (data) => {
        closeModal();
        const next = getPipelineFocus(data.pipelineStages, "admin");
        if (next.headline && next.kind !== "idle") {
          toast.success(`Verified. Next: ${next.headline}`);
        } else {
          toast.success("Verified.");
        }
      },
      onError: (e) => errToast(e, qc)
    });
  };

  const runMilestonePayout = () => {
    if (!lead || !milestoneReadyForLead) return;
    if (!lead.project?.deploymentVerifiedAt) {
      toast.error("Verify deployment before paying the milestone.");
      return;
    }
    milestonePayout.mutate(undefined, {
      meta: { skipSuccessToast: true },
      onSuccess: (data) => {
        closeModal();
        const next = getPipelineFocus(data.pipelineStages, "admin");
        if (next.headline && next.kind !== "idle") {
          toast.success(`Milestone paid. Next: ${next.headline}`);
        } else {
          toast.success(modelBMilestonePaidToast());
        }
      },
      onError: (e) => errToast(e, qc)
    });
  };

  const runVerify = () => {
    if (!activeStage) return;
    if (activeStage === "commission" && isModelBRep && !lead?.commission && milestoneReadyForLead) {
      runMilestonePayout();
      return;
    }
    if (activeStage === "commission" && lead?.commission) {
      if (!lead.project?.deploymentVerifiedAt) {
        toast.error("Verify deployment before marking commission paid.");
        return;
      }
      markCommissionPaid.mutate(lead.commission.id, {
        meta: { skipSuccessToast: true },
        onSuccess: (data) => {
          closeModal();
          const next = getPipelineFocus(data.pipelineStages, "admin");
          if (next.headline && next.kind !== "idle") {
            toast.success(`Commission marked paid. Next: ${next.headline}`);
          } else {
            toast.success("Commission marked paid.");
          }
        },
        onError: (e) => errToast(e, qc)
      });
      return;
    }
    const apiKey = STAGE_TO_VERIFY[activeStage];
    if (!apiKey) return;
    if (activeStage === "repo_transfer") {
      setTransferredGithubRepoUrlError(null);
      try {
        const url = prepareGithubRepoUrlForMutation(transferredGithubRepoUrl);
        verifyStage.mutate(
          { stageKey: apiKey, body: { transferredGithubRepoUrl: url } },
          {
            meta: { skipSuccessToast: true },
            onSuccess: (data) => {
              closeModal();
              const next = getPipelineFocus(data.pipelineStages, "admin");
              if (next.headline && next.kind !== "idle") {
                toast.success(`Verified. Next: ${next.headline}`);
              } else {
                toast.success("Verified.");
              }
            },
            onError: (e) => errToast(e, qc)
          }
        );
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "Enter a valid GitHub repo link (e.g. github.com/owner/repo).";
        setTransferredGithubRepoUrlError(msg);
        errToast(e, qc);
      }
      return;
    }
    runStageVerify(apiKey);
  };

  const runDecline = () => {
    if (!activeStage) return;
    const apiKey = STAGE_REJECTABLE[activeStage];
    if (!apiKey) return;
    rejectStage.mutate(
      { stageKey: apiKey, adminNote: declineNote.trim() || null },
      { onSuccess: closeModal, onError: (e) => errToast(e, qc) }
    );
  };

  const verifyPreviewReady = (onDone?: () => void, skipStageToast = false) => {
    verifyStage.mutate("preview_ready", {
      meta: skipStageToast ? { skipSuccessToast: true } : undefined,
      onSuccess: (data) => {
        closeModal();
        const next = getPipelineFocus(data.pipelineStages, "admin");
        if (next.headline && next.kind !== "idle") {
          toast.success(`Demo marked ready. Next: ${next.headline}`);
        } else {
          toast.success("Demo marked ready for the rep.");
        }
        onDone?.();
      },
      onError: (e) => errToast(e, qc)
    });
  };

  const runSavePreview = (onDone?: () => void) => {
    setPreviewUrlError(null);
    try {
      const url = prepareHttpUrlForMutation(previewUrl);
      patch.mutate(
        { previewUrl: url },
        {
          meta: { skipSuccessToast: true },
          onSuccess: () => {
            toast.success("Preview URL saved. You can mark demo ready next.");
            onDone?.();
          },
          onError: (e) => errToast(e, qc)
        }
      );
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Enter a valid link (e.g. https://example.com or example.com).";
      setPreviewUrlError(msg);
      errToast(e, qc);
    }
  };

  const runMarkDemoReady = () => {
    if (activeStage !== "build_demo" || !lead) return;
    setPreviewUrlError(null);
    let draftNormalized: string | null;
    try {
      draftNormalized = prepareHttpUrlForMutation(previewUrl);
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Enter a valid link (e.g. https://example.com or example.com).";
      setPreviewUrlError(msg);
      errToast(e, qc);
      return;
    }
    const serverNormalized = lead.project?.previewUrl
      ? tryNormalizeHttpUrl(lead.project.previewUrl)
      : null;
    const needsSave =
      draftNormalized != null &&
      (serverNormalized == null || draftNormalized !== serverNormalized);

    if (!needsSave && serverNormalized) {
      verifyPreviewReady();
      return;
    }
    if (draftNormalized) {
      runSavePreview(() => verifyPreviewReady(undefined, true));
      return;
    }
    const msg = "Enter a valid preview URL before marking demo ready.";
    setPreviewUrlError(msg);
    toast.error(msg);
  };

  const markDemoPending = patch.isPending || verifyStage.isPending;

  if (leadQr.isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (lead && repId && lead.assignedToUserId && lead.assignedToUserId !== repId) {
    return (
      <Navigate
        to={`/portal/team/${lead.assignedToUserId}/projects/${lead.id}`}
        replace
      />
    );
  }

  if (leadQr.isError || !lead || !repId) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <QueryErrorAlert
          message="Could not load this project."
          onRetry={() => void leadQr.refetch()}
        />
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="link" className="min-h-11">
            <Link to={repId ? `/portal/team/${repId}` : "/portal/team"}>Back to rep</Link>
          </Button>
          <Button asChild variant="link" className="min-h-11">
            <Link to="/portal/projects">All clients</Link>
          </Button>
        </div>
      </div>
    );
  }

  const repFromTeam = teamRepQr.data?.rep;
  const repFromList = repsQr.data?.items.find((r) => r.id === repId);
  const repName =
    repFromTeam?.displayName?.trim() ||
    repFromTeam?.email ||
    repFromList?.displayName?.trim() ||
    repFromList?.email ||
    "Rep";
  const repRemoved = Boolean(repFromTeam?.archivedAt);
  const rejectable = activeStage ? STAGE_REJECTABLE[activeStage] : undefined;
  const declineFeedback = findDeclineFeedbackStage(stages);

  if (!lead.convertedAt && lead.prospectCategory === "NOT_INTERESTED") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/portal/team" className="hover:underline">
            Team
          </Link>
          <span className="mx-2">/</span>
          <Link to={`/portal/team/${repId}`} className="hover:underline">
            {repName}
            {repRemoved ? " (removed)" : ""}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{lead.clientName}</span>
        </nav>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <Button variant="ghost" className="min-h-11 w-fit -ml-2" asChild>
            <Link to={`/portal/team/${repId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
              Back to rep
            </Link>
          </Button>
          <DataStaleToolbar
            dataUpdatedAt={leadQr.dataUpdatedAt}
            onRefresh={() => void leadQr.refetch()}
            isFetching={leadQr.isFetching}
          />
        </div>

        <div>
          <h1 className="text-xl font-semibold md:text-2xl">{lead.clientName}</h1>
          <p className="text-sm text-muted-foreground">
            Archived prospect · {leadStatusLabel(lead.status)}
          </p>
        </div>

        <NotInterestedArchiveBanner lead={lead} actorMode="admin" onRestored={() => void leadQr.refetch()} />

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

  const verifiedAdvance = lead.payments?.find(
    (p) => p.kind === "ADVANCE" && p.verificationStatus === "VERIFIED"
  );
  const verifiedFinal = lead.payments?.find(
    (p) => p.kind === "FINAL" && p.verificationStatus === "VERIFIED"
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/portal/team" className="hover:underline">
          Team
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/portal/team/${repId}`} className="hover:underline">
          {repName}
          {repRemoved ? " (removed)" : ""}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{lead.clientName}</span>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Button variant="ghost" className="min-h-11 w-fit -ml-2" asChild>
          <Link to={`/portal/team/${repId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to rep
          </Link>
        </Button>
        <DataStaleToolbar
          dataUpdatedAt={leadQr.dataUpdatedAt}
          onRefresh={() => void leadQr.refetch()}
          isFetching={leadQr.isFetching}
        />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-semibold md:text-2xl">{lead.clientName}</h1>
        <p className="text-sm text-muted-foreground">
          {lead.convertedAt ? "Client" : "Prospect"} · {leadStatusLabel(lead.status)}
          {lead.agreedTotalCents != null ? ` · ${formatMinorUnits(lead.agreedTotalCents)}` : ""}
        </p>
        {!lead.convertedAt ? (
          <p className="text-sm">
            Category: <span className="font-semibold">{prospectCategoryLabel(lead.prospectCategory)}</span>
          </p>
        ) : null}
        {!lead.convertedAt ? <ProspectCategoryBadge lead={lead} /> : null}
        {!lead.convertedAt && canChangeProspectCategory(lead) ? (
          <SetProspectCategoryDialog
            leadId={lead.id}
            clientName={lead.clientName}
            lead={lead}
            triggerLabel="Change category"
            onUpdated={() => void leadQr.refetch()}
          />
        ) : null}
      </div>

      {!lead.convertedAt ? (
        <>
          <InterestedSampleStatusCard
            lead={lead}
            onUpdated={() => void leadQr.refetch()}
            readOnly={false}
          />
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wide">Category history</h2>
            <ProspectCategoryTimeline leadId={lead.id} />
          </section>
        </>
      ) : null}

      {declineFeedback ? (
        <DeclineFeedbackBanner
          stageTitle={declineFeedback.title}
          declineNote={declineFeedback.declineNote ?? null}
        />
      ) : null}

      <PipelineFocusCard
        stages={stages}
        actorMode="admin"
        onPrimaryAction={handleStageClick}
      />

      <PipelineStepsAccordion
        stages={stages}
        actorMode="admin"
        onStageClick={handleStageClick}
      />

      <div className="space-y-2 rounded-lg border p-4">
        <Label htmlFor="assign-rep">Assigned rep</Label>
        <Select
          value={lead.assignedToUserId ?? "__none__"}
          onValueChange={(v) =>
            patch.mutate(
              { assignedToUserId: v === "__none__" ? null : v },
              { onError: (e) => errToast(e, qc) }
            )
          }
        >
          <SelectTrigger id="assign-rep" className="min-h-11">
            <SelectValue placeholder="Choose rep" />
          </SelectTrigger>
          <SelectContent>
            {(repsQr.data?.items ?? []).map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.displayName ?? r.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(verifiedAdvance?.externalReference || verifiedFinal?.externalReference) && (
        <div className="rounded-lg border p-4 text-sm space-y-2">
          <p className="font-medium">Verified payments</p>
          {verifiedAdvance?.externalReference ? (
            <p>
              Advance {paymentReferenceFieldCopy(verifiedAdvance.repNote).verifiedLabel}:{" "}
              <span className="font-mono text-xs">{verifiedAdvance.externalReference}</span>
            </p>
          ) : null}
          {verifiedFinal?.externalReference ? (
            <p>
              Due {paymentReferenceFieldCopy(verifiedFinal.repNote).verifiedLabel}:{" "}
              <span className="font-mono text-xs">{verifiedFinal.externalReference}</span>
            </p>
          ) : null}
        </div>
      )}

      {isModelBRep && repSummary?.milestone ? (
        <MilestoneProgressCard milestone={repSummary.milestone} variant="admin" />
      ) : null}

      {milestoneReadyForLead && !lead.commission ? (
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm space-y-3">
          <p className="font-medium text-primary">{modelBMilestoneDealHeadline()}</p>
          <p className="text-muted-foreground">
            This rep completed five verified deployments. Pay the milestone to create and close the
            payout in one step.
          </p>
          <Button
            className="min-h-11"
            disabled={milestonePayout.isPending || !lead.project?.deploymentVerifiedAt}
            onClick={() =>
              milestonePayout.mutate(undefined, {
                onSuccess: () => toast.success(modelBMilestonePaidToast()),
                onError: (e) => errToast(e, qc)
              })
            }
          >
            {milestonePayout.isPending ? "Paying…" : modelBMilestonePayCta()}
          </Button>
        </div>
      ) : null}

      {lead.commission ? (
        <AdminCommissionSummary lead={lead} isModelBRep={isModelBRep} />
      ) : null}

      <AdminVerifyModals
        lead={lead}
        pipelineStages={stages}
        activeStage={activeStage}
        onClose={closeModal}
        previewUrl={previewUrl}
        onPreviewUrlChange={(v) => {
          setPreviewUrl(v);
          if (previewUrlError) setPreviewUrlError(null);
        }}
        previewUrlError={previewUrlError}
        verify={{
          onVerify: runVerify,
          onDecline: rejectable ? runDecline : undefined,
          isPending:
            verifyStage.isPending ||
            rejectStage.isPending ||
            markCommissionPaid.isPending ||
            milestonePayout.isPending,
          declineNote,
          onDeclineNoteChange: setDeclineNote
        }}
        onSavePreview={() => runSavePreview()}
        savePreviewPending={patch.isPending}
        onMarkDemoReady={runMarkDemoReady}
        markDemoPending={markDemoPending}
        transferredGithubRepoUrl={transferredGithubRepoUrl}
        onTransferredGithubRepoUrlChange={(v) => {
          setTransferredGithubRepoUrl(v);
          if (transferredGithubRepoUrlError) setTransferredGithubRepoUrlError(null);
        }}
        transferredGithubRepoUrlError={transferredGithubRepoUrlError}
        repCommissionModel={repSummary?.commissionModel}
        milestoneReadyForLead={milestoneReadyForLead}
        onMilestonePayout={runMilestonePayout}
      />

      <PaymentVerifyDialog
        payment={verifyPayment}
        open={verifyPayment != null}
        onOpenChange={(o) => !o && setVerifyPayment(null)}
        isPending={verifyPay.isPending}
        lead={lead}
        templateLabel={lead.websiteTemplate ? formatTemplateOption(lead.websiteTemplate) : null}
        websiteTemplate={lead.websiteTemplate ?? null}
        paymentShareMethods={paymentShareMethods}
        onVerify={(paymentId, body) =>
          verifyPay.mutate(
            { paymentId, body },
            { onSuccess: () => setVerifyPayment(null), onError: (e) => errToast(e, qc) }
          )
        }
      />
    </div>
  );
}
