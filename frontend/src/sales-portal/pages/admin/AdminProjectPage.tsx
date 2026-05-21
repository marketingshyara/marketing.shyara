import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { StageModalShell } from "../../components/pipeline/StageModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PipelineProgress } from "../../components/pipeline/PipelineProgress";
import { PaymentVerifyDialog } from "../../components/pipeline/PaymentVerifyDialog";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import {
  useLeadQuery,
  useMarkCommissionPaidMutation,
  usePatchLeadMutation,
  useVerifyLeadStageMutation,
  useVerifyPaymentMutation
} from "../../hooks/useSalesQueries";
import type { LeadPayment, PipelineStageKey, PipelineStageVerifyKey, PipelineStageView } from "../../types";
import { formatMinorUnits } from "../../lib/money";
import { leadStatusLabel } from "../../lib/copy";

const STAGE_TO_VERIFY: Partial<Record<PipelineStageKey, PipelineStageVerifyKey>> = {
  whatsapp_group: "whatsapp",
  build_demo: "preview_ready",
  accounts_ready: "accounts_ready",
  repo_transfer: "repo_transfer",
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
  const leadQr = useLeadQuery(leadId);
  const [activeStage, setActiveStage] = useState<PipelineStageKey | null>(null);
  const [verifyPayment, setVerifyPayment] = useState<LeadPayment | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const verifyPay = useVerifyPaymentMutation(leadId ?? "");
  const verifyStage = useVerifyLeadStageMutation(leadId ?? "");
  const markCommissionPaid = useMarkCommissionPaidMutation();
  const patch = usePatchLeadMutation(leadId ?? "");

  const lead = leadQr.data?.lead;
  const stages = leadQr.data?.pipelineStages ?? [];

  const closeModal = () => setActiveStage(null);

  const pendingAdvance = lead?.payments?.find(
    (p) => p.kind === "ADVANCE" && p.verificationStatus === "PENDING"
  );
  const pendingFinal = lead?.payments?.find(
    (p) => p.kind === "FINAL" && p.verificationStatus === "PENDING"
  );

  const handleStageClick = (key: PipelineStageKey) => {
    if (!lead) return;
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
    const stage = stages.find((s) => s.key === key);
    if (!stage || !isAdminActionable(stage)) {
      return;
    }
    setActiveStage(key);
  };

  if (leadQr.isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (
    lead &&
    repId &&
    lead.assignedToUserId &&
    lead.assignedToUserId !== repId
  ) {
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

  const idleBuild = stages.find((s) => s.key === "build_demo")?.hint;

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
          {lead.agreedTotalCents != null
            ? ` · ${formatMinorUnits(lead.agreedTotalCents)}`
            : ""}
        </p>
      </div>

      {idleBuild ? (
        <Alert>
          <AlertTitle>Waiting on technical team</AlertTitle>
          <AlertDescription>{idleBuild}</AlertDescription>
        </Alert>
      ) : null}

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

      <PipelineProgress stages={stages} onStageClick={handleStageClick} actorMode="admin" />

      <StageModalShell
        open={activeStage === "whatsapp_group"}
        onOpenChange={(o) => !o && closeModal()}
        title="Verify WhatsApp group"
        description={
          lead.whatsappGroupLink
            ? `Rep submitted: ${lead.whatsappGroupLink}`
            : "Rep has not saved a group link yet."
        }
        footer={
          <Button
            className="min-h-11 w-full sm:w-auto"
            disabled={verifyStage.isPending || !lead.whatsappGroupLink}
            onClick={() => verifyStage.mutate("whatsapp", { onSuccess: closeModal })}
          >
            Verify WhatsApp
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          Confirm advance payment is verified and the group link is valid.
        </p>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "build_demo"}
        onOpenChange={(o) => !o && closeModal()}
        title="Demo link"
        footer={
          <>
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={patch.isPending}
              onClick={() =>
                patch.mutate({ previewUrl: previewUrl.trim() || null }, { onSuccess: closeModal })
              }
            >
              Save preview URL
            </Button>
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={verifyStage.isPending || !previewUrl.trim()}
              onClick={() => verifyStage.mutate("preview_ready", { onSuccess: closeModal })}
            >
              Mark demo ready
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="admin-preview">Preview URL</Label>
          <Input
            id="admin-preview"
            className="min-h-11"
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
          />
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "accounts_ready"}
        onOpenChange={(o) => !o && closeModal()}
        title="Verify accounts ready"
        description="Rep marked GitHub and hosting accounts as set up."
        footer={
          <Button
            className="min-h-11 w-full sm:w-auto"
            disabled={verifyStage.isPending}
            onClick={() => verifyStage.mutate("accounts_ready", { onSuccess: closeModal })}
          >
            Verify accounts
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          Confirm accounts exist before the client pays the due amount.
        </p>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "repo_transfer"}
        onOpenChange={(o) => !o && closeModal()}
        title="Verify repository transfer"
        footer={
          <Button
            className="min-h-11 w-full sm:w-auto"
            disabled={verifyStage.isPending}
            onClick={() => verifyStage.mutate("repo_transfer", { onSuccess: closeModal })}
          >
            Verify repo transfer
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          Confirm repository ownership moved to the client.
        </p>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "deployment_verify"}
        onOpenChange={(o) => !o && closeModal()}
        title="Verify deployment"
        description={
          lead.project?.deployedUrl
            ? `Live URL: ${lead.project.deployedUrl}`
            : "Rep has not submitted a live URL yet."
        }
        footer={
          <Button
            className="min-h-11 w-full sm:w-auto"
            disabled={verifyStage.isPending || !lead.project?.deployedUrl}
            onClick={() => verifyStage.mutate("deployment", { onSuccess: closeModal })}
          >
            Verify deployment
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          Confirms the site is live and unlocks commission payout.
        </p>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "commission"}
        onOpenChange={(o) => !o && closeModal()}
        title="Commission payout"
        footer={
          lead.commission && !lead.commission.isPaid ? (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={markCommissionPaid.isPending}
              onClick={() =>
                markCommissionPaid.mutate(lead.commission!.id, { onSuccess: closeModal })
              }
            >
              Mark commission paid
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Commission already paid or not due yet.</p>
          )
        }
      >
        <p className="text-sm text-muted-foreground">
          Mark paid after funds are sent (typically 3–5 business days).
        </p>
      </StageModalShell>

      <PaymentVerifyDialog
        payment={verifyPayment}
        open={verifyPayment != null}
        onOpenChange={(o) => !o && setVerifyPayment(null)}
        isPending={verifyPay.isPending}
        onVerify={(paymentId, body) =>
          verifyPay.mutate(
            { paymentId, body },
            { onSuccess: () => setVerifyPayment(null) }
          )
        }
      />
    </div>
  );
}
