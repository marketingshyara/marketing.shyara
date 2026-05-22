import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AdminVerifyModals } from "../../components/pipeline/AdminVerifyModals";
import { PaymentVerifyDialog } from "../../components/pipeline/PaymentVerifyDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PipelineFocusCard } from "../../components/pipeline/PipelineFocusCard";
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
import {
  errToast,
  useLeadQuery,
  useMarkCommissionPaidMutation,
  usePatchCommissionMutation,
  usePatchLeadMutation,
  useRejectLeadStageMutation,
  useTeamRepsQuery,
  useVerifyLeadStageMutation,
  useVerifyPaymentMutation
} from "../../hooks/useSalesQueries";
import { prepareHttpUrlForMutation, tryNormalizeHttpUrl } from "../../lib/httpUrl";
import type { LeadPayment, PipelineStageKey, PipelineStageVerifyKey, PipelineStageView } from "../../types";
import { centsToRupeeInputString, formatMinorUnits, parseRupeeInputToCents } from "../../lib/money";
import { leadStatusLabel } from "../../lib/copy";
import { formatTemplateOption } from "../../lib/templateLabel";
import { toastIfStageBlocked } from "../../lib/pipelineStageGuard";
import { getPipelineFocus } from "../../lib/pipelineCopy";
import { adminCanOpenStageModal } from "../../lib/adminPipelineStageClick";
import { toast } from "sonner";

const STAGE_TO_VERIFY: Partial<Record<PipelineStageKey, PipelineStageVerifyKey>> = {
  whatsapp_group: "whatsapp",
  demo_finalized: "demo_finalized",
  build_demo: "preview_ready",
  accounts_ready: "accounts_ready",
  repo_transfer: "repo_transfer",
  deployment_verify: "deployment"
};

const STAGE_REJECTABLE: Partial<Record<PipelineStageKey, PipelineStageVerifyKey>> = {
  whatsapp_group: "whatsapp",
  demo_finalized: "demo_finalized",
  accounts_ready: "accounts_ready",
  deployment_verify: "deployment"
};

export function AdminProjectPage() {
  const { repId, leadId } = useParams<{ repId: string; leadId: string }>();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const leadQr = useLeadQuery(leadId);
  const repsQr = useTeamRepsQuery(true);
  const [activeStage, setActiveStage] = useState<PipelineStageKey | null>(null);
  const [verifyPayment, setVerifyPayment] = useState<LeadPayment | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [declineNote, setDeclineNote] = useState("");
  const [commissionEditRupees, setCommissionEditRupees] = useState("");
  const [previewUrlError, setPreviewUrlError] = useState<string | null>(null);

  const verifyPay = useVerifyPaymentMutation(leadId ?? "", repId);
  const verifyStage = useVerifyLeadStageMutation(leadId ?? "", repId);
  const rejectStage = useRejectLeadStageMutation(leadId ?? "", repId);
  const markCommissionPaid = useMarkCommissionPaidMutation(leadId ?? "", repId);
  const patchCommission = usePatchCommissionMutation(leadId ?? "", repId);
  const patch = usePatchLeadMutation(leadId ?? "", repId);

  const lead = leadQr.data?.lead;
  const stages = leadQr.data?.pipelineStages ?? [];

  const closeModal = () => {
    setActiveStage(null);
    setDeclineNote("");
  };

  useEffect(() => {
    setActiveStage(null);
    setVerifyPayment(null);
    setDeclineNote("");
    setPreviewUrl("");
    setCommissionEditRupees("");
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
      if (lead.commission) {
        setCommissionEditRupees(centsToRupeeInputString(lead.commission.amountCents));
      }
      setActiveStage(key);
      return;
    }
    if (adminCanOpenStageModal(stage)) {
      setActiveStage(key);
    }
  };

  const runVerify = () => {
    if (!activeStage) return;
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
    verifyStage.mutate(apiKey, {
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
        <Button asChild variant="link" className="min-h-11">
          <Link to={repId ? `/portal/team/${repId}` : "/portal/team"}>Back to rep</Link>
        </Button>
      </div>
    );
  }

  const repName =
    repsQr.data?.items.find((r) => r.id === repId)?.displayName ??
    repsQr.data?.items.find((r) => r.id === repId)?.email ??
    "Rep";
  const rejectable = activeStage ? STAGE_REJECTABLE[activeStage] : undefined;

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
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{lead.clientName}</span>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Button variant="ghost" className="min-h-11 w-fit -ml-2" asChild>
          <Link to={`/portal/team/${repId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to projects
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
          Client · {leadStatusLabel(lead.status)}
          {lead.agreedTotalCents != null ? ` · ${formatMinorUnits(lead.agreedTotalCents)}` : ""}
        </p>
      </div>

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
              Advance Razorpay reference:{" "}
              <span className="font-mono text-xs">{verifiedAdvance.externalReference}</span>
            </p>
          ) : null}
          {verifiedFinal?.externalReference ? (
            <p>
              Due Razorpay reference:{" "}
              <span className="font-mono text-xs">{verifiedFinal.externalReference}</span>
            </p>
          ) : null}
        </div>
      )}

      {lead.commission ? (
        <div className="rounded-lg border p-4 text-sm">
          <p>
            Commission: {formatMinorUnits(lead.commission.amountCents)}
            {lead.commission.bonusCents > 0
              ? ` + ${formatMinorUnits(lead.commission.bonusCents)} bonus`
              : ""}
          </p>
          <p className="text-muted-foreground">
            {lead.commission.isPaid ? "Paid" : "Pending payout after you verify deployment"}
          </p>
        </div>
      ) : null}

      <AdminVerifyModals
        lead={lead}
        activeStage={activeStage}
        onClose={closeModal}
        previewUrl={previewUrl}
        onPreviewUrlChange={(v) => {
          setPreviewUrl(v);
          if (previewUrlError) setPreviewUrlError(null);
        }}
        previewUrlError={previewUrlError}
        commissionEditRupees={commissionEditRupees}
        onCommissionEditRupeesChange={setCommissionEditRupees}
        verify={{
          onVerify: runVerify,
          onDecline: rejectable ? runDecline : undefined,
          isPending:
            verifyStage.isPending || rejectStage.isPending || markCommissionPaid.isPending,
          declineNote,
          onDeclineNoteChange: setDeclineNote
        }}
        onSavePreview={() => runSavePreview()}
        savePreviewPending={patch.isPending}
        onMarkDemoReady={runMarkDemoReady}
        markDemoPending={markDemoPending}
        onPatchCommission={() => {
          const cents = parseRupeeInputToCents(commissionEditRupees);
          if (!lead.commission) return;
          if (cents == null || cents <= 0) {
            toast.error("Enter a valid commission amount in rupees.");
            return;
          }
          patchCommission.mutate(
            { id: lead.commission.id, amountCents: cents },
            {
              onSuccess: (data) => {
                if (data.commission) {
                  setCommissionEditRupees(centsToRupeeInputString(data.commission.amountCents));
                }
              },
              onError: (e) => errToast(e, qc)
            }
          );
        }}
        patchCommissionPending={patchCommission.isPending}
      />

      <PaymentVerifyDialog
        payment={verifyPayment}
        open={verifyPayment != null}
        onOpenChange={(o) => !o && setVerifyPayment(null)}
        isPending={verifyPay.isPending}
        clientName={lead.clientName}
        templateLabel={lead.websiteTemplate ? formatTemplateOption(lead.websiteTemplate) : null}
        agreedTotalCents={lead.agreedTotalCents}
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
