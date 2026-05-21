import { StageModalShell } from "./StageModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Lead, PipelineStageKey } from "../../types";
import { formatMinorUnits } from "../../lib/money";
import { formatTemplateOption } from "../../lib/templateLabel";
import { stageNextStepHint } from "../../lib/pipelineCopy";

function hasVerifiedAdvance(lead: Lead): boolean {
  return (
    lead.payments?.some(
      (p) => p.kind === "ADVANCE" && p.verificationStatus === "VERIFIED"
    ) ?? false
  );
}

type VerifyHandlers = {
  onVerify: () => void;
  onDecline?: () => void;
  isPending: boolean;
  declineNote: string;
  onDeclineNoteChange: (v: string) => void;
};

type Props = {
  lead: Lead;
  activeStage: PipelineStageKey | null;
  onClose: () => void;
  previewUrl: string;
  onPreviewUrlChange: (v: string) => void;
  commissionEditRupees: string;
  onCommissionEditRupeesChange: (v: string) => void;
  verify: VerifyHandlers;
  onSavePreview: () => void;
  savePreviewPending: boolean;
  onPatchCommission?: () => void;
  patchCommissionPending?: boolean;
};

function VerifyFooter({ verify, verifyLabel = "Verify" }: { verify: VerifyHandlers; verifyLabel?: string }) {
  return (
    <>
      {verify.onDecline ? (
        <Button
          type="button"
          variant="destructive"
          className="min-h-11 w-full sm:w-auto"
          disabled={verify.isPending}
          onClick={verify.onDecline}
        >
          Decline
        </Button>
      ) : null}
      <Button
        type="button"
        className="min-h-11 w-full sm:w-auto"
        disabled={verify.isPending}
        onClick={verify.onVerify}
      >
        {verifyLabel}
      </Button>
    </>
  );
}

export function AdminVerifyModals({
  lead,
  activeStage,
  onClose,
  previewUrl,
  onPreviewUrlChange,
  commissionEditRupees,
  onCommissionEditRupeesChange,
  verify,
  onSavePreview,
  savePreviewPending,
  onPatchCommission,
  patchCommissionPending
}: Props) {
  const templateLabel = lead.websiteTemplate
    ? formatTemplateOption(lead.websiteTemplate)
    : lead.websiteTemplateId ?? "—";

  const adminModalHint = activeStage ? stageNextStepHint(activeStage, "admin") : undefined;

  return (
    <>
      <StageModalShell
        open={activeStage === "convert_deal"}
        onOpenChange={(o) => !o && onClose()}
        title="Deal submitted"
        description="Review template and agreed total before verifying advance payment."
      >
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Template</dt>
            <dd>{templateLabel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Agreed total</dt>
            <dd>{lead.agreedTotalCents != null ? formatMinorUnits(lead.agreedTotalCents) : "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Advance</dt>
            <dd>
              {lead.advanceAmountCents != null ? formatMinorUnits(lead.advanceAmountCents) : "—"}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-muted-foreground">
          Open advance payment verify from the progress step or Reviews queue.
        </p>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "whatsapp_group"}
        onOpenChange={(o) => !o && onClose()}
        title="Verify WhatsApp group"
        description={
          lead.whatsappGroupLink
            ? `Rep submitted: ${lead.whatsappGroupLink}`
            : "Rep has not saved a group link yet."
        }
        nextStepHint={adminModalHint}
        footer={
          <VerifyFooter
            verify={{
              ...verify,
              onVerify: verify.onVerify,
              onDecline: verify.onDecline
            }}
            verifyLabel="Verify WhatsApp"
          />
        }
      >
        {verify.onDecline ? (
          <div className="space-y-2">
            <Label htmlFor="decline-note-wa">Decline note (optional)</Label>
            <Textarea
              id="decline-note-wa"
              value={verify.declineNote}
              onChange={(e) => verify.onDeclineNoteChange(e.target.value)}
            />
          </div>
        ) : null}
      </StageModalShell>

      <StageModalShell
        open={activeStage === "demo_finalized"}
        onOpenChange={(o) => !o && onClose()}
        title="Verify demo approval"
        description={
          lead.demoFinalizedAt
            ? `Rep marked client approval on ${new Date(lead.demoFinalizedAt).toLocaleString()}.`
            : "Rep has not marked demo approval yet."
        }
        nextStepHint={adminModalHint}
        footer={
          <VerifyFooter verify={verify} verifyLabel="Verify demo approval" />
        }
      >
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Preview URL</dt>
            <dd className="break-all">{lead.project?.previewUrl ?? "—"}</dd>
          </div>
        </dl>
        {verify.onDecline ? (
          <div className="mt-3 space-y-2">
            <Label htmlFor="decline-note-demo">Decline note (optional)</Label>
            <Textarea
              id="decline-note-demo"
              value={verify.declineNote}
              onChange={(e) => verify.onDeclineNoteChange(e.target.value)}
            />
          </div>
        ) : null}
      </StageModalShell>

      <StageModalShell
        open={activeStage === "build_demo"}
        onOpenChange={(o) => !o && onClose()}
        title="Demo preview link"
        description="Step 1: Save the staging or preview URL. Step 2: Mark demo ready so the rep can continue."
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              disabled={
                savePreviewPending || !hasVerifiedAdvance(lead) || !previewUrl.trim()
              }
              onClick={onSavePreview}
            >
              {savePreviewPending ? "Saving…" : "1. Save preview URL"}
            </Button>
            <Button
              type="button"
              className="min-h-11 w-full sm:w-auto"
              disabled={verify.isPending || !lead.project?.previewUrl}
              onClick={verify.onVerify}
            >
              2. Mark demo ready
            </Button>
          </>
        }
      >
        {!hasVerifiedAdvance(lead) ? (
          <p className="mb-3 text-sm text-amber-700 dark:text-amber-400">
            Verify the advance payment first — a project record is created when advance is approved.
          </p>
        ) : null}
        {lead.project?.previewUrl ? (
          <dl className="mb-3 grid gap-1 text-sm">
            <dt className="text-muted-foreground">Saved on server</dt>
            <dd className="break-all font-medium">{lead.project.previewUrl}</dd>
          </dl>
        ) : (
          <p className="mb-3 text-sm text-muted-foreground">
            No preview URL saved yet. The rep cannot proceed until you save and mark demo ready.
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="admin-preview">Preview URL</Label>
          <Input
            id="admin-preview"
            className="min-h-11"
            type="url"
            inputMode="url"
            placeholder="https://… or example.com"
            value={previewUrl}
            onChange={(e) => onPreviewUrlChange(e.target.value)}
            disabled={!hasVerifiedAdvance(lead)}
          />
          <p className="text-xs text-muted-foreground">
            You can paste a link without https:// — we will add it automatically.
          </p>
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "accounts_ready"}
        onOpenChange={(o) => !o && onClose()}
        title="Verify accounts ready"
        description={
          lead.accountsReadyAt
            ? `Rep marked on ${new Date(lead.accountsReadyAt).toLocaleString()}.`
            : "Rep has not marked accounts ready."
        }
        nextStepHint={adminModalHint}
        footer={<VerifyFooter verify={verify} verifyLabel="Verify accounts" />}
      >
        {verify.onDecline ? (
          <div className="space-y-2">
            <Label htmlFor="decline-note-acct">Decline note (optional)</Label>
            <Textarea
              id="decline-note-acct"
              value={verify.declineNote}
              onChange={(e) => verify.onDeclineNoteChange(e.target.value)}
            />
          </div>
        ) : null}
      </StageModalShell>

      <StageModalShell
        open={activeStage === "deployment_submit"}
        onOpenChange={(o) => !o && onClose()}
        title="Deployment submitted"
        description="Rep submitted the live URL. Open deployment verify when you are ready to approve."
        footer={
          <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={onClose}>
            Close
          </Button>
        }
      >
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Live URL</dt>
            <dd className="break-all">{lead.project?.deployedUrl ?? "—"}</dd>
          </div>
          {lead.project?.deploymentSubmittedAt ? (
            <div>
              <dt className="text-muted-foreground">Submitted</dt>
              <dd>{new Date(lead.project.deploymentSubmittedAt).toLocaleString()}</dd>
            </div>
          ) : null}
        </dl>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "deployment_verify"}
        onOpenChange={(o) => !o && onClose()}
        title="Verify deployment"
        description={
          lead.project?.deployedUrl
            ? `Live URL: ${lead.project.deployedUrl}`
            : "Rep has not submitted a live URL yet."
        }
        nextStepHint={adminModalHint}
        footer={<VerifyFooter verify={verify} verifyLabel="Verify deployment" />}
      >
        {verify.onDecline ? (
          <div className="space-y-2">
            <Label htmlFor="decline-note-dep">Decline note (optional)</Label>
            <Textarea
              id="decline-note-dep"
              value={verify.declineNote}
              onChange={(e) => verify.onDeclineNoteChange(e.target.value)}
            />
          </div>
        ) : null}
      </StageModalShell>

      <StageModalShell
        open={activeStage === "repo_transfer"}
        onOpenChange={(o) => !o && onClose()}
        title="Verify repository transfer"
        description="Confirm repository ownership moved to the client after due payment is verified and before the rep submits the live URL."
        footer={<VerifyFooter verify={verify} verifyLabel="Verify repo transfer" />}
      >
        <p className="text-sm text-muted-foreground">
          Confirm repository ownership moved to the client.
        </p>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "commission"}
        onOpenChange={(o) => !o && onClose()}
        title="Commission payout"
        description={
          lead.commission?.isPaid
            ? "Commission has been marked paid."
            : "Adjust the payout amount if needed, then mark commission paid after deployment is verified."
        }
        nextStepHint={adminModalHint}
        footer={
          lead.commission && !lead.commission.isPaid ? (
            <>
              {onPatchCommission ? (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full sm:w-auto"
                  disabled={patchCommissionPending}
                  onClick={onPatchCommission}
                >
                  Save amount
                </Button>
              ) : null}
              <Button
                type="button"
                className="min-h-11 w-full sm:w-auto"
                disabled={verify.isPending}
                onClick={verify.onVerify}
              >
                Mark commission paid
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Commission already paid or not due yet.</p>
          )
        }
      >
        {lead.commission ? (
          <div className="space-y-3 text-sm">
            <p>
              Amount: {formatMinorUnits(lead.commission.amountCents)}
              {lead.commission.bonusCents > 0
                ? ` + ${formatMinorUnits(lead.commission.bonusCents)} bonus`
                : ""}
            </p>
            {onPatchCommission && !lead.commission.isPaid ? (
              <div className="space-y-2">
                <Label htmlFor="comm-edit">Edit amount (₹)</Label>
                <Input
                  id="comm-edit"
                  className="min-h-11"
                  inputMode="decimal"
                  value={commissionEditRupees}
                  onChange={(e) => onCommissionEditRupeesChange(e.target.value)}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Commission is created after deployment verify.</p>
        )}
      </StageModalShell>
    </>
  );
}
