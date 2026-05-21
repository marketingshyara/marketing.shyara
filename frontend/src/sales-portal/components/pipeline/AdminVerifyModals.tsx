import { StageModalShell } from "./StageModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Lead, PipelineStageKey } from "../../types";
import { formatMinorUnits } from "../../lib/money";
import { formatTemplateOption } from "../../lib/templateLabel";

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
        title="Demo link"
        footer={
          <>
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={savePreviewPending}
              onClick={onSavePreview}
            >
              Save preview URL
            </Button>
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={verify.isPending || !previewUrl.trim()}
              onClick={verify.onVerify}
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
            onChange={(e) => onPreviewUrlChange(e.target.value)}
          />
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
        description="Rep submitted the live URL. Verify on the next step when ready."
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
        <Button type="button" className="mt-4 min-h-11" onClick={onClose}>
          Close
        </Button>
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
