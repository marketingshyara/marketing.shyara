import { StageModalShell } from "./StageModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Lead, LeadStatus, PipelineStageKey } from "../../types";
import { formatMinorUnits, parseRupeeInputToCents } from "../../lib/money";
import { useAdminSettingsQuery } from "../../hooks/useSalesQueries";
import {
  commissionBasisLabel,
  commissionRateLabel,
  estimatedCommissionForLead
} from "../../lib/commissionEstimate";
import { formatTemplateOption } from "../../lib/templateLabel";
import { tryNormalizeHttpUrl } from "../../lib/httpUrl";
import { PortalMetaGrid } from "../ui/PortalMetaGrid";

function ModalDisabledHints({ reasons }: { reasons: string[] }) {
  if (reasons.length === 0) return null;
  return (
    <ul className="w-full list-disc space-y-1 pl-5 text-left text-xs text-muted-foreground">
      {reasons.map((r) => (
        <li key={r}>{r}</li>
      ))}
    </ul>
  );
}

function hasVerifiedAdvance(lead: Lead): boolean {
  return (
    lead.payments?.some(
      (p) => p.kind === "ADVANCE" && p.verificationStatus === "VERIFIED"
    ) ?? false
  );
}

function hasVerifiedFinal(lead: Lead): boolean {
  return (
    lead.payments?.some(
      (p) => p.kind === "FINAL" && p.verificationStatus === "VERIFIED"
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
  onMarkDemoReady: () => void;
  markDemoPending: boolean;
  previewUrlError?: string | null;
  onPatchCommission?: () => void;
  patchCommissionPending?: boolean;
};

function VerifyFooter({
  verify,
  verifyLabel = "Verify",
  verifyDisabled = false
}: {
  verify: VerifyHandlers;
  verifyLabel?: string;
  verifyDisabled?: boolean;
}) {
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
        disabled={verify.isPending || verifyDisabled}
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
  onMarkDemoReady,
  markDemoPending,
  previewUrlError,
  onPatchCommission,
  patchCommissionPending
}: Props) {
  const templateLabel = lead.websiteTemplate
    ? formatTemplateOption(lead.websiteTemplate)
    : lead.websiteTemplateId ?? "—";

  const advanceOk = hasVerifiedAdvance(lead);
  const previewOnServer = Boolean(lead.project?.previewUrl);
  const previewDraftValid = tryNormalizeHttpUrl(previewUrl.trim()) != null;
  const canMarkDemoReady =
    advanceOk && (previewOnServer || previewDraftValid) && !markDemoPending;

  const saveDisabledReasons: string[] = [];
  if (!advanceOk) saveDisabledReasons.push("Verify the advance payment before saving a preview URL.");
  else if (!previewUrl.trim()) saveDisabledReasons.push("Enter a preview URL to save.");

  const markDisabledReasons: string[] = [];
  if (!advanceOk) markDisabledReasons.push("Verify the advance payment first.");
  else if (!previewOnServer && !previewDraftValid)
    markDisabledReasons.push("Enter a valid preview URL, or save it first.");
  else if (!previewOnServer && previewDraftValid)
    markDisabledReasons.push("We will save your URL, then mark the demo ready.");

  const finalOk = hasVerifiedFinal(lead);
  const repoDone = Boolean(lead.repoTransferVerifiedAt);
  const deploySubmitted = Boolean(
    lead.project?.deploymentSubmittedAt && lead.project?.deployedUrl
  );
  const deployVerified = Boolean(lead.project?.deploymentVerifiedAt);

  const repoDisabledReasons: string[] = [];
  if (!finalOk) repoDisabledReasons.push("Verify the due (final) payment before confirming repo transfer.");
  if (repoDone) repoDisabledReasons.push("Repository transfer is already verified.");

  const deployDisabledReasons: string[] = [];
  if (!deploySubmitted)
    deployDisabledReasons.push("Rep must submit the live URL before you can verify deployment.");
  if (deployVerified) deployDisabledReasons.push("Deployment is already verified.");

  const settingsQr = useAdminSettingsQuery(activeStage === "commission");
  const portalSettings = settingsQr.data?.settings;

  const commissionCents = parseRupeeInputToCents(commissionEditRupees);
  const commissionSaveValid =
    commissionCents != null && commissionCents > 0 && lead.commission != null;
  const commissionUnchanged =
    lead.commission != null &&
    commissionCents != null &&
    commissionCents === lead.commission.amountCents;

  const commissionStatusOk = (s: LeadStatus) => s === "DEPLOYED" || s === "FINAL_PAID";
  const canMarkCommissionPaid =
    Boolean(
      lead.commission &&
        !lead.commission.isPaid &&
        deployVerified &&
        commissionStatusOk(lead.status)
    );

  const commissionMarkDisabledReasons: string[] = [];
  if (!lead.commission) {
    commissionMarkDisabledReasons.push("Verify deployment first — commission is created after the site is live.");
  } else if (lead.commission.isPaid) {
    commissionMarkDisabledReasons.push("Commission is already marked paid.");
  } else if (!deployVerified) {
    commissionMarkDisabledReasons.push("Verify deployment first — commission is due after the site is live.");
  } else if (!commissionStatusOk(lead.status)) {
    commissionMarkDisabledReasons.push("Complete due payment verification before marking commission paid.");
  }

  const commissionSaveDisabledReasons: string[] = [];
  if (lead.commission && !lead.commission.isPaid && onPatchCommission) {
    if (!commissionEditRupees.trim()) {
      commissionSaveDisabledReasons.push("Enter a commission amount in rupees to save.");
    } else if (commissionUnchanged) {
      commissionSaveDisabledReasons.push("Amount unchanged — edit the value before saving.");
    } else if (!commissionSaveValid) {
      commissionSaveDisabledReasons.push("Enter a valid positive amount in rupees.");
    }
  }

  const estimatedCents =
    portalSettings != null ? estimatedCommissionForLead(lead, portalSettings) : null;

  return (
    <>
      <StageModalShell
        open={activeStage === "convert_deal"}
        onOpenChange={(o) => !o && onClose()}
        title="Deal submitted"
      >
        <PortalMetaGrid
          items={[
            { label: "Template", value: templateLabel },
            {
              label: "Agreed total",
              value: lead.agreedTotalCents != null ? formatMinorUnits(lead.agreedTotalCents) : "—"
            },
            {
              label: "Advance",
              value: lead.advanceAmountCents != null ? formatMinorUnits(lead.advanceAmountCents) : "—"
            }
          ]}
        />
        <p className="mt-3 text-xs text-muted-foreground">Verify advance on Reviews or Payments.</p>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "whatsapp_group"}
        onOpenChange={(o) => !o && onClose()}
        title="Verify WhatsApp group"
        footer={
          <>
            <VerifyFooter
              verify={{
                ...verify,
                onVerify: verify.onVerify,
                onDecline: verify.onDecline
              }}
              verifyLabel="Verify WhatsApp"
              verifyDisabled={!lead.whatsappGroupLink}
            />
            {!lead.whatsappGroupLink ? (
              <ModalDisabledHints reasons={["Rep has not submitted a WhatsApp group link yet."]} />
            ) : null}
          </>
        }
      >
        <PortalMetaGrid
          items={[
            {
              label: "Group link",
              value: lead.whatsappGroupLink ? (
                <span className="break-all">{lead.whatsappGroupLink}</span>
              ) : (
                "—"
              )
            }
          ]}
        />
        {verify.onDecline ? (
          <div className="mt-3 space-y-2">
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
        footer={
          <>
            <VerifyFooter
              verify={verify}
              verifyLabel="Verify demo approval"
              verifyDisabled={!lead.demoFinalizedAt}
            />
            {!lead.demoFinalizedAt ? (
              <ModalDisabledHints reasons={["Rep has not marked demo approval from the client yet."]} />
            ) : null}
          </>
        }
      >
        <PortalMetaGrid
          items={[
            {
              label: "Client approved",
              value: lead.demoFinalizedAt
                ? new Date(lead.demoFinalizedAt).toLocaleString()
                : "Not yet"
            },
            {
              label: "Preview URL",
              value: <span className="break-all">{lead.project?.previewUrl ?? "—"}</span>
            }
          ]}
        />
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
        footer={
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full sm:w-auto"
                disabled={savePreviewPending || !advanceOk || !previewUrl.trim()}
                onClick={onSavePreview}
              >
                {savePreviewPending ? "Saving…" : "1. Save preview URL"}
              </Button>
              <Button
                type="button"
                className="min-h-11 w-full sm:w-auto"
                disabled={!canMarkDemoReady}
                onClick={onMarkDemoReady}
              >
                {markDemoPending ? "Working…" : "2. Mark demo ready"}
              </Button>
            </div>
            <ModalDisabledHints
              reasons={[
                ...(savePreviewPending || !advanceOk || !previewUrl.trim() ? saveDisabledReasons : []),
                ...(!canMarkDemoReady ? markDisabledReasons : [])
              ]}
            />
          </div>
        }
      >
        {!hasVerifiedAdvance(lead) ? (
          <p className="mb-3 text-xs text-amber-700 dark:text-amber-400">
            Verify advance payment first.
          </p>
        ) : null}
        {lead.project?.previewUrl ? (
          <PortalMetaGrid
            className="mb-3"
            items={[
              {
                label: "Saved URL",
                value: <span className="break-all">{lead.project.previewUrl}</span>
              }
            ]}
          />
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="admin-preview">Preview URL</Label>
          <Input
            id="admin-preview"
            className="min-h-11"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="https://… or example.com"
            value={previewUrl}
            onChange={(e) => onPreviewUrlChange(e.target.value)}
            disabled={!advanceOk}
            aria-invalid={!!previewUrlError}
            aria-describedby={previewUrlError ? "admin-preview-error" : "admin-preview-hint"}
          />
          {previewUrlError ? (
            <p id="admin-preview-error" className="text-xs text-destructive" role="alert">
              {previewUrlError}
            </p>
          ) : (
            <p id="admin-preview-hint" className="text-xs text-muted-foreground">
              You can paste a link without https:// — we will add it automatically.
            </p>
          )}
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "accounts_ready"}
        onOpenChange={(o) => !o && onClose()}
        title="Verify accounts ready"
        footer={
          <>
            <VerifyFooter
              verify={verify}
              verifyLabel="Verify accounts"
              verifyDisabled={!lead.accountsReadyAt}
            />
            {!lead.accountsReadyAt ? (
              <ModalDisabledHints reasons={["Rep has not marked accounts ready yet."]} />
            ) : null}
          </>
        }
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
        <PortalMetaGrid
          items={[
            {
              label: "Rep marked",
              value: lead.accountsReadyAt
                ? new Date(lead.accountsReadyAt).toLocaleString()
                : "Not yet"
            }
          ]}
        />
      </StageModalShell>

      <StageModalShell
        open={activeStage === "deployment_submit"}
        onOpenChange={(o) => !o && onClose()}
        title="Deployment submitted"
        footer={
          <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={onClose}>
            Close
          </Button>
        }
      >
        <PortalMetaGrid
          items={[
            {
              label: "Live URL",
              value: <span className="break-all">{lead.project?.deployedUrl ?? "—"}</span>
            },
            ...(lead.project?.deploymentSubmittedAt
              ? [
                  {
                    label: "Submitted",
                    value: new Date(lead.project.deploymentSubmittedAt).toLocaleString()
                  }
                ]
              : [])
          ]}
        />
      </StageModalShell>

      <StageModalShell
        open={activeStage === "deployment_verify"}
        onOpenChange={(o) => !o && onClose()}
        title="Verify deployment"
        footer={
          <>
            <VerifyFooter
              verify={verify}
              verifyLabel="Verify deployment"
              verifyDisabled={!deploySubmitted || deployVerified}
            />
            <ModalDisabledHints
              reasons={!deploySubmitted || deployVerified ? deployDisabledReasons : []}
            />
          </>
        }
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
        <PortalMetaGrid
          items={[
            {
              label: "Live URL",
              value: <span className="break-all">{lead.project?.deployedUrl ?? "—"}</span>
            }
          ]}
        />
      </StageModalShell>

      <StageModalShell
        open={activeStage === "repo_transfer"}
        onOpenChange={(o) => !o && onClose()}
        title="Verify repository transfer"
        footer={
          <>
            <VerifyFooter
              verify={verify}
              verifyLabel="Verify repo transfer"
              verifyDisabled={!finalOk || repoDone}
            />
            <ModalDisabledHints reasons={!finalOk || repoDone ? repoDisabledReasons : []} />
          </>
        }
      >
        <p className="text-xs text-muted-foreground">Repo ownership moved to client.</p>
        {!finalOk ? (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
            Verify due payment first.
          </p>
        ) : null}
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
                  disabled={
                    patchCommissionPending ||
                    !commissionSaveValid ||
                    commissionUnchanged
                  }
                  onClick={onPatchCommission}
                >
                  Save amount
                </Button>
              ) : null}
              <Button
                type="button"
                className="min-h-11 w-full sm:w-auto"
                disabled={verify.isPending || !canMarkCommissionPaid}
                onClick={verify.onVerify}
              >
                Mark commission paid
              </Button>
              <ModalDisabledHints
                reasons={[
                  ...(patchCommissionPending ||
                  !commissionSaveValid ||
                  commissionUnchanged
                    ? commissionSaveDisabledReasons
                    : []),
                  ...(!canMarkCommissionPaid ? commissionMarkDisabledReasons : [])
                ]}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Commission already paid or not due yet.</p>
          )
        }
      >
        {lead.commission ? (
          <div className="space-y-3 text-sm">
            <p>
              Saved amount: {formatMinorUnits(lead.commission.amountCents)}
              {lead.commission.bonusCents > 0
                ? ` + ${formatMinorUnits(lead.commission.bonusCents)} bonus`
                : ""}
            </p>
            {portalSettings && !lead.commission.isPaid ? (
              <PortalMetaGrid
                items={[
                  { label: "Basis", value: commissionBasisLabel(portalSettings.commissionBasis) },
                  { label: "Rate", value: commissionRateLabel(portalSettings) },
                  ...(estimatedCents != null
                    ? [{ label: "Estimate", value: formatMinorUnits(estimatedCents) }]
                    : [])
                ]}
              />
            ) : null}
            {onPatchCommission && !lead.commission.isPaid ? (
              <div className="space-y-2">
                <Label htmlFor="comm-edit">Payout amount (₹)</Label>
                <Input
                  id="comm-edit"
                  className="min-h-11"
                  inputMode="decimal"
                  value={commissionEditRupees}
                  onChange={(e) => onCommissionEditRupeesChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  You may adjust slightly before saving.
                </p>
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
