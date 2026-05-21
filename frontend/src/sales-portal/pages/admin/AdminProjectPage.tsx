import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AdminVerifyModals } from "../../components/pipeline/AdminVerifyModals";
import { PaymentVerifyDialog } from "../../components/pipeline/PaymentVerifyDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { prepareHttpUrlForMutation } from "../../lib/httpUrl";
import type { LeadPayment, PipelineStageKey, PipelineStageVerifyKey, PipelineStageView } from "../../types";
import { formatMinorUnits, parseRupeeInputToCents } from "../../lib/money";
import { leadStatusLabel } from "../../lib/copy";
import { formatTemplateOption } from "../../lib/templateLabel";
import { toastIfStageBlocked } from "../../lib/pipelineStageGuard";
import { getPipelineFocus } from "../../lib/pipelineCopy";
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

function isAdminActionable(stage: PipelineStageView): boolean {
  return (
    stage.adminActor &&
    (stage.state === "actionable" || stage.state === "pending_admin")
  );
}

export function AdminProjectPage() {
  const { repId, leadId } = useParams<{ repId: string; leadId: string }>();
  const [searchParams] = useSearchParams();
  const leadQr = useLeadQuery(leadId);
  const repsQr = useTeamRepsQuery(true);
  const [activeStage, setActiveStage] = useState<PipelineStageKey | null>(null);
  const [verifyPayment, setVerifyPayment] = useState<LeadPayment | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [declineNote, setDeclineNote] = useState("");
  const [commissionEditRupees, setCommissionEditRupees] = useState("");

  const verifyPay = useVerifyPaymentMutation(leadId ?? "", repId);
  const verifyStage = useVerifyLeadStageMutation(leadId ?? "", repId);
  const rejectStage = useRejectLeadStageMutation(leadId ?? "", repId);
  const markCommissionPaid = useMarkCommissionPaidMutation(repId);
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
    if (lead?.commission && commissionEditRupees === "") {
      setCommissionEditRupees(String(lead.commission.amountCents / 100));
    }
  }, [lead?.commission?.amountCents, commissionEditRupees]);

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
    if (key === "advance_verify" && pendingAdvance) {
      setVerifyPayment(pendingAdvance);
      return;
    }
    if (key === "final_verify" && pendingFinal) {
      setVerifyPayment(pendingFinal);
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
    if (key === "commission" || isAdminActionable(stage)) {
      setActiveStage(key);
    }
  };

  const runVerify = () => {
    if (!activeStage) return;
    const apiKey = STAGE_TO_VERIFY[activeStage];
    if (!apiKey) return;
    if (activeStage === "commission" && lead?.commission) {
      markCommissionPaid.mutate(lead.commission.id, { onSuccess: closeModal });
      return;
    }
    verifyStage.mutate(apiKey, {
      onSuccess: () => {
        closeModal();
        const next = getPipelineFocus(stages, "admin");
        if (next.headline && next.kind !== "idle") {
          toast.success(`Verified. Next: ${next.headline}`);
        } else {
          toast.success("Verified.");
        }
      }
    });
  };

  const runDecline = () => {
    if (!activeStage) return;
    const apiKey = STAGE_REJECTABLE[activeStage];
    if (!apiKey) return;
    rejectStage.mutate(
      { stageKey: apiKey, adminNote: declineNote.trim() || null },
      { onSuccess: closeModal }
    );
  };

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

  const buildDemoStage = stages.find((s) => s.key === "build_demo");
  const repWaitingForPreview =
    buildDemoStage?.state === "actionable" &&
    !lead.project?.previewUrl &&
    lead.whatsappVerifiedAt != null;
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
          Rep
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

      {repWaitingForPreview ? (
        <Alert>
          <AlertTitle>Rep waiting for demo link</AlertTitle>
          <AlertDescription>
            Save the preview URL and mark demo ready so the rep can show the site to the client.
          </AlertDescription>
        </Alert>
      ) : null}

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
            patch.mutate({ assignedToUserId: v === "__none__" ? null : v })
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
        onPreviewUrlChange={setPreviewUrl}
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
        onSavePreview={() => {
          try {
            const url = prepareHttpUrlForMutation(previewUrl);
            patch.mutate({ previewUrl: url });
          } catch (e) {
            errToast(e);
          }
        }}
        savePreviewPending={patch.isPending}
        onPatchCommission={() => {
          const cents = parseRupeeInputToCents(commissionEditRupees);
          if (cents == null || !lead.commission) return;
          patchCommission.mutate({ id: lead.commission.id, amountCents: cents });
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
          verifyPay.mutate({ paymentId, body }, { onSuccess: () => setVerifyPayment(null) })
        }
      />
    </div>
  );
}
