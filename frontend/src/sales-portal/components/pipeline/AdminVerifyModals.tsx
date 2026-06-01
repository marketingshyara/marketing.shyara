import { StageModalShell } from "./StageModalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Lead, LeadStatus, PipelineStageKey } from "../../types";
import { formatMinorUnits } from "../../lib/money";
import { useAdminSettingsQuery } from "../../hooks/useSalesQueries";
import { DealAmountField } from "./DealAmountField";
import {
  commissionRateLabel,
  estimatedCommissionForLead,
  formatPerformanceBonusSuffix,
  performanceBonusPayoutHint
} from "../../lib/commissionEstimate";
import { formatTemplateOption } from "../../lib/templateLabel";
import { WebsiteTemplateField } from "./WebsiteTemplateField";
import { tryNormalizeHttpUrl } from "../../lib/httpUrl";
import { tryNormalizeGithubRepoUrl } from "../../lib/githubRepoUrl";
import { PortalMetaGrid } from "../ui/PortalMetaGrid";
import { PortalLinkDisplay } from "../ui/PortalLinkDisplay";
import { DeclineFeedbackInline } from "./DeclineFeedbackBanner";
import {
  accountsReadyMetaItems,
  accountsReadyMissingGithubHint
} from "./accountsReadyMetaItems";
import { declineNoteForStage } from "../../lib/declineFeedback";
import type { PipelineStageView } from "../../types";

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
  pipelineStages: PipelineStageView[];
  activeStage: PipelineStageKey | null;
  onClose: () => void;
  previewUrl: string;
  onPreviewUrlChange: (v: string) => void;
  verify: VerifyHandlers;
  onSavePreview: () => void;
  savePreviewPending: boolean;
  onMarkDemoReady: () => void;
  markDemoPending: boolean;
  previewUrlError?: string | null;
  transferredGithubRepoUrl?: string;
  onTransferredGithubRepoUrlChange?: (v: string) => void;
  transferredGithubRepoUrlError?: string | null;
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
  pipelineStages,
  activeStage,
  onClose,
  previewUrl,
  onPreviewUrlChange,
  verify,
  onSavePreview,
  savePreviewPending,
  onMarkDemoReady,
  markDemoPending,
  previewUrlError,
  transferredGithubRepoUrl = "",
  onTransferredGithubRepoUrlChange = () => {},
  transferredGithubRepoUrlError = null
}: Props) {
  const templateLabel = lead.websiteTemplate
    ? formatTemplateOption(lead.websiteTemplate)
    : lead.websiteTemplateId ?? "—";

  const stageDecline = (key: PipelineStageKey) => declineNoteForStage(pipelineStages, key);

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
  const repoUrlDraftValid = tryNormalizeGithubRepoUrl(transferredGithubRepoUrl) != null;
  const repoUrlRequired = finalOk && !repoDone;
  if (repoUrlRequired && !repoUrlDraftValid) {
    repoDisabledReasons.push("Enter the transferred GitHub repository link.");
  }

  const deployDisabledReasons: string[] = [];
  if (!deploySubmitted)
    deployDisabledReasons.push("Rep must submit the live URL before you can verify deployment.");
  if (deployVerified) deployDisabledReasons.push("Deployment is already verified.");

  const settingsQr = useAdminSettingsQuery(activeStage === "commission");
  const portalSettings = settingsQr.data?.settings;

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

  const estimatedCents =
    portalSettings != null ? estimatedCommissionForLead(lead, portalSettings) : null;
  const performanceBonusHint =
    portalSettings != null && lead.commission && !lead.commission.isPaid
      ? performanceBonusPayoutHint(lead, portalSettings)
      : null;

  return (
    <>
      <StageModalShell
        open={activeStage === "lead_capture"}
        onOpenChange={(o) => !o && onClose()}
        title={
          lead.clientDetailsSubmittedAt && !lead.clientDetailsVerifiedAt
            ? "Verify client details"
            : "Client details"
        }
        description={
          lead.clientDetailsSubmittedAt && !lead.clientDetailsVerifiedAt
            ? "Rep updated contact fields after conversion."
            : undefined
        }
        footer={
          lead.clientDetailsSubmittedAt && !lead.clientDetailsVerifiedAt ? (
            <VerifyFooter verify={verify} verifyLabel="Verify client details" />
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="min-h-11 w-full sm:w-auto"
              onClick={onClose}
            >
              Close
            </Button>
          )
        }
      >
        {(() => {
          const note = stageDecline("lead_capture");
          return note !== undefined ? (
            <DeclineFeedbackInline declineNote={note} className="mb-3" />
          ) : null;
        })()}
        <PortalMetaGrid
          items={[
            { label: "Client name", value: lead.clientName },
            { label: "Email", value: lead.clientEmail ?? "—" },
            { label: "Phone", value: lead.clientPhone ?? "—" },
            { label: "Notes", value: lead.notes?.trim() ? lead.notes : "—" }
          ]}
        />
        {verify.onDecline && lead.clientDetailsSubmittedAt && !lead.clientDetailsVerifiedAt ? (
          <div className="mt-3 space-y-2">
            <Label htmlFor="decline-note-lead">Decline note (optional)</Label>
            <Textarea
              id="decline-note-lead"
              value={verify.declineNote}
              onChange={(e) => verify.onDeclineNoteChange(e.target.value)}
            />
          </div>
        ) : null}
      </StageModalShell>

      <StageModalShell
        open={activeStage === "convert_deal"}
        onOpenChange={(o) => !o && onClose()}
        title="Deal submitted"
      >
        <WebsiteTemplateField
          templates={lead.websiteTemplate ? [lead.websiteTemplate] : []}
          value={lead.websiteTemplateId ?? ""}
          mode="readonly"
          label="Website template chosen"
        />
        <PortalMetaGrid
          className="mt-4"
          items={[
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
        {(() => {
          const note = stageDecline("whatsapp_group");
          return note !== undefined ? (
            <DeclineFeedbackInline declineNote={note} className="mb-3" />
          ) : null;
        })()}
        <PortalMetaGrid
          items={[
            {
              label: "Group link",
              value: (
                <PortalLinkDisplay
                  url={lead.whatsappGroupLink}
                  copyLabel="Group link"
                  variant="plain"
                />
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
        {(() => {
          const note = stageDecline("demo_finalized");
          return note !== undefined ? (
            <DeclineFeedbackInline declineNote={note} className="mb-3" />
          ) : null;
        })()}
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
              value: (
                <PortalLinkDisplay
                  url={lead.project?.previewUrl}
                  copyLabel="Preview URL"
                  variant="plain"
                />
              )
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
                value: (
                  <PortalLinkDisplay
                    url={lead.project.previewUrl}
                    copyLabel="Preview URL"
                    variant="plain"
                  />
                )
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
        {(() => {
          const note = stageDecline("accounts_ready");
          return note !== undefined ? (
            <DeclineFeedbackInline declineNote={note} className="mb-3" />
          ) : null;
        })()}
        <PortalMetaGrid items={accountsReadyMetaItems(lead)} />
        {accountsReadyMissingGithubHint(lead) ? (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-300" role="status">
            Rep submission missing GitHub details — ask rep to resubmit.
          </p>
        ) : null}
        {verify.onDecline ? (
          <div className="mt-3 space-y-2">
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
        footer={
          <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={onClose}>
            Close
          </Button>
        }
      >
        {(() => {
          const note = stageDecline("deployment_submit");
          return note !== undefined ? (
            <DeclineFeedbackInline declineNote={note} className="mb-3" />
          ) : null;
        })()}
        <PortalMetaGrid
          items={[
            {
              label: "Live URL",
              value: (
                <PortalLinkDisplay
                  url={lead.project?.deployedUrl}
                  copyLabel="Live URL"
                  variant="plain"
                />
              )
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
        {(() => {
          const note = stageDecline("deployment_verify");
          return note !== undefined ? (
            <DeclineFeedbackInline declineNote={note} className="mb-3" />
          ) : null;
        })()}
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
              value: (
                <PortalLinkDisplay
                  url={lead.project?.deployedUrl}
                  copyLabel="Live URL"
                  variant="plain"
                />
              )
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
              verifyDisabled={!finalOk || repoDone || (repoUrlRequired && !repoUrlDraftValid)}
            />
            <ModalDisabledHints reasons={repoDisabledReasons} />
          </>
        }
      >
        <div className="min-w-0 space-y-3">
          <p className="text-xs text-muted-foreground">
            Confirm the repo now lives under the client&apos;s GitHub account after they accepted the
            transfer.
          </p>
          {!finalOk ? (
            <p className="text-xs text-amber-700 dark:text-amber-400" role="status">
              Verify due payment first.
            </p>
          ) : null}
          {(lead.clientGithubId || lead.clientGithubEmail) && !repoDone ? (
            <PortalMetaGrid items={accountsReadyMetaItems(lead).slice(0, 2)} />
          ) : null}
          {repoDone && lead.transferredGithubRepoUrl ? (
            <PortalMetaGrid
              items={[
                {
                  label: "Transferred repo",
                  value: (
                    <PortalLinkDisplay
                      url={lead.transferredGithubRepoUrl}
                      copyLabel="GitHub repo"
                      variant="plain"
                    />
                  )
                }
              ]}
            />
          ) : !repoDone ? (
            <div className="space-y-2">
              <Label htmlFor="transferred-github-repo">Transferred GitHub repository link</Label>
              <Input
                id="transferred-github-repo"
                className="min-h-11"
                type="url"
                inputMode="url"
                placeholder="github.com/client-org/website-repo"
                value={transferredGithubRepoUrl}
                onChange={(e) => onTransferredGithubRepoUrlChange(e.target.value)}
                aria-invalid={transferredGithubRepoUrlError ? true : undefined}
                aria-describedby={
                  transferredGithubRepoUrlError
                    ? "transferred-github-repo-error"
                    : "transferred-github-repo-hint"
                }
              />
              {transferredGithubRepoUrlError ? (
                <p
                  id="transferred-github-repo-error"
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {transferredGithubRepoUrlError}
                </p>
              ) : (
                <p id="transferred-github-repo-hint" className="text-xs text-muted-foreground">
                  Paste the repo URL under the client&apos;s account (e.g. github.com/owner/repo).
                </p>
              )}
            </div>
          ) : null}
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "commission"}
        onOpenChange={(o) => !o && onClose()}
        title="Commission payout"
        footer={
          lead.commission && !lead.commission.isPaid ? (
            <>
              <Button
                type="button"
                className="min-h-11 w-full sm:w-auto"
                disabled={verify.isPending || !canMarkCommissionPaid}
                onClick={verify.onVerify}
              >
                Mark commission paid
              </Button>
              <ModalDisabledHints
                reasons={!canMarkCommissionPaid ? commissionMarkDisabledReasons : []}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Commission already paid or not due yet.</p>
          )
        }
      >
        {lead.commission ? (
          <div className="min-w-0 space-y-3 text-sm">
            {portalSettings && !lead.commission.isPaid ? (
              <>
                <PortalMetaGrid
                  items={[
                    {
                      label: "Agreed total",
                      value: formatMinorUnits(lead.agreedTotalCents)
                    },
                    { label: "Rate", value: commissionRateLabel(portalSettings) }
                  ]}
                />
                <DealAmountField
                  id="commission-payout"
                  label="Commission payout"
                  amountCents={lead.commission.amountCents}
                  hint="Calculated automatically from agreed total × rate"
                  missingMessage="Agreed total is missing on this deal."
                />
                {estimatedCents != null && estimatedCents !== lead.commission.amountCents ? (
                  <p className="text-xs text-amber-700 dark:text-amber-300" role="status">
                    Payout will refresh to {formatMinorUnits(estimatedCents)} when you mark
                    commission paid.
                  </p>
                ) : null}
                {performanceBonusHint ? (
                  <p className="text-xs text-muted-foreground" role="status">
                    {performanceBonusHint}
                  </p>
                ) : null}
              </>
            ) : (
              <p>
                Payout: {formatMinorUnits(lead.commission.amountCents)}
                {formatPerformanceBonusSuffix(lead.commission.bonusCents, portalSettings)}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Commission is created after deployment verify.</p>
        )}
      </StageModalShell>
    </>
  );
}
