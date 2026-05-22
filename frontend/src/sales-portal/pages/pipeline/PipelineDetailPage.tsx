import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import { StageModalWaitingFooter } from "../../components/pipeline/StageModalWaiting";
import { PipelineStepsAccordion } from "../../components/pipeline/PipelineStepsAccordion";
import { QueryErrorAlert } from "../../components/QueryErrorAlert";
import { DataStaleToolbar } from "../../components/DataStaleToolbar";
import {
  errToast,
  useConvertLeadMutation,
  useLeadQuery,
  useMarkPaymentMutation,
  usePatchLeadMutation,
  usePortalSettingsQuery,
  usePatchProjectMutation,
  useWebsiteTemplatesQuery
} from "../../hooks/useSalesQueries";
import { prepareHttpUrlForMutation } from "../../lib/httpUrl";
import { toastIfStageBlocked } from "../../lib/pipelineStageGuard";
import type { PipelineStageKey } from "../../types";
import { formatMinorUnits, parseRupeeInputToCents } from "../../lib/money";
import { formatTemplateOption } from "../../lib/templateLabel";
import { Badge } from "@/components/ui/badge";
import { leadStatusLabel } from "../../lib/copy";
import { IndianMobileField } from "../../components/IndianMobileField";
import { isValidIndianMobile, normalizeIndianMobileInput } from "../../lib/indianMobilePhone";

export function PipelineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const leadQr = useLeadQuery(id);
  const settingsQr = usePortalSettingsQuery();
  const tplQr = useWebsiteTemplatesQuery(true);

  const [activeStage, setActiveStage] = useState<PipelineStageKey | null>(null);
  const [readOnlyModal, setReadOnlyModal] = useState(false);

  const patch = usePatchLeadMutation(id ?? "");
  const convert = useConvertLeadMutation(id ?? "");
  const markPay = useMarkPaymentMutation(id ?? "");
  const patchProject = usePatchProjectMutation(id);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [agreedRupees, setAgreedRupees] = useState("");
  const [advanceNote, setAdvanceNote] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [dueRupees, setDueRupees] = useState("");
  const [deployUrl, setDeployUrl] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    setActiveStage(null);
    setReadOnlyModal(false);
    setClientName("");
    setClientPhone("");
    setNotes("");
    setTemplateId("");
    setAgreedRupees("");
    setAdvanceNote("");
    setWhatsappLink("");
    setDueRupees("");
    setDeployUrl("");
  }, [id]);

  const loading = leadQr.isLoading || (settingsQr.isLoading && !settingsQr.isError);
  const lead = leadQr.data?.lead;
  const stages = leadQr.data?.pipelineStages ?? [];
  const declineFeedback = findDeclineFeedbackStage(stages);
  const settings = settingsQr.data?.settings;

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

  const closeModal = () => {
    setActiveStage(null);
    setReadOnlyModal(false);
  };

  const handleStageClick = (key: PipelineStageKey) => {
    if (!lead) return;
    const stage = stages.find((s) => s.key === key);
    if (toastIfStageBlocked(stages, key)) return;
    setReadOnlyModal(stage?.state === "pending_admin");

    if (key === "lead_capture") {
      setClientName(lead.clientName);
      setClientPhone(lead.clientPhone ?? "");
      setNotes(lead.notes ?? "");
      setPhoneError(null);
    }
    if (key === "convert_deal") {
      setTemplateId(lead.websiteTemplateId ?? "");
      setAgreedRupees(
        lead.agreedTotalCents ? String(lead.agreedTotalCents / 100) : ""
      );
      if (lead.convertedAt) {
        setReadOnlyModal(true);
      }
    }
    if (key === "whatsapp_group") {
      setWhatsappLink(lead.whatsappGroupLink ?? "");
    }
    if (key === "final_payment" && lead.finalQuoteCents) {
      setDueRupees(String(lead.finalQuoteCents / 100));
    }
    if (key === "deployment_submit") {
      setDeployUrl(lead.project?.deployedUrl ?? "");
    }
    setActiveStage(key);
  };

  const minRupees = settings ? settings.minAgreedTotalCents / 100 : 7999;

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

      <div>
        <h1 className="text-xl font-semibold md:text-2xl">{lead.clientName}</h1>
        <p className="text-sm text-muted-foreground">
          {lead.convertedAt ? "Client" : "Lead"} · {leadStatusLabel(lead.status)}
        </p>
      </div>

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
      />

      <PipelineStepsAccordion
        stages={stages}
        actorMode="rep"
        onStageClick={handleStageClick}
      />

      {lead.commission && (
        <div className="rounded-lg border p-4 text-sm space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">
              Commission: {formatMinorUnits(lead.commission.amountCents)}
              {lead.commission.bonusCents > 0
                ? ` + ${formatMinorUnits(lead.commission.bonusCents)} bonus`
                : ""}
            </p>
            <Badge variant={lead.commission.isPaid ? "default" : "secondary"}>
              {lead.commission.isPaid ? "Paid" : "Pending payout"}
            </Badge>
          </div>
          <Button variant="link" className="h-auto min-h-11 px-0 text-sm" asChild>
            <Link to="/portal/commission">View all commission</Link>
          </Button>
        </div>
      )}

      <StageModalShell
        open={activeStage === "lead_capture"}
        onOpenChange={(o) => !o && closeModal()}
        title="Lead details"
        footer={
          readOnlyModal ? (
            <StageModalWaitingFooter />
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
                setPhoneError(null);
                patch.mutate(
                  {
                    clientName: clientName.trim(),
                    clientPhone: digits || null,
                    notes: notes.trim() || null
                  },
                  { onSuccess: closeModal }
                );
              }}
            >
              Save
            </Button>
          )
        }
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input id="edit-name" className="min-h-11" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <IndianMobileField
            id="edit-phone"
            label="Mobile number"
            value={clientPhone}
            onChange={(v) => {
              setClientPhone(v);
              if (phoneError) setPhoneError(null);
            }}
            error={phoneError ?? undefined}
          />
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "convert_deal"}
        onOpenChange={(o) => !o && closeModal()}
        title={readOnlyModal ? "Deal submitted" : "Convert to client"}
        footer={
          readOnlyModal ? (
            <StageModalWaitingFooter />
          ) : (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={convert.isPending || !templateId || !agreedRupees.trim()}
              onClick={() => {
                const agreedTotalCents = parseRupeeInputToCents(agreedRupees);
                if (agreedTotalCents == null) return;
                convert.mutate(
                  {
                    websiteTemplateId: templateId,
                    agreedTotalCents,
                    repNote: advanceNote.trim() || null
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
        {settings?.templatesCatalogUrl ? (
          <Button variant="link" className="mb-3 h-auto px-0" asChild>
            <a href={settings.templatesCatalogUrl} target="_blank" rel="noreferrer">
              View template samples
            </a>
          </Button>
        ) : null}
        {(() => {
          const note = declineNoteForStage(stages, "convert_deal");
          return note !== undefined ? (
            <DeclineFeedbackInline declineNote={note} className="mb-3" />
          ) : null;
        })()}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={templateId || "__none__"} onValueChange={(v) => setTemplateId(v === "__none__" ? "" : v)}>
              <SelectTrigger className="min-h-11">
                <SelectValue placeholder="Choose template" />
              </SelectTrigger>
              <SelectContent>
                {(tplQr.data?.items ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {formatTemplateOption(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="agreed">Agreed total (₹)</Label>
            <Input id="agreed" className="min-h-11" inputMode="decimal" value={agreedRupees} onChange={(e) => setAgreedRupees(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              Min ₹{minRupees}. Advance {settings ? settings.advancePaymentShareBps / 100 : 50}%.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adv-note">Payment note (optional)</Label>
            <Input id="adv-note" className="min-h-11" value={advanceNote} onChange={(e) => setAdvanceNote(e.target.value)} />
          </div>
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "whatsapp_group"}
        onOpenChange={(o) => !o && closeModal()}
        title="WhatsApp group"
        footer={
          readOnlyModal ? (
            <StageModalWaitingFooter />
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
          <Input
            id="wa-link"
            className="min-h-11"
            type="url"
            inputMode="url"
            placeholder="https://chat.whatsapp.com/…"
            value={whatsappLink}
            onChange={(e) => setWhatsappLink(e.target.value)}
          />
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "demo_finalized"}
        onOpenChange={(o) => !o && closeModal()}
        title="Demo approved"
        footer={
          readOnlyModal ? (
            <StageModalWaitingFooter />
          ) : (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={patch.isPending}
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
        <p className="text-xs text-muted-foreground">Client signed off on the demo.</p>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "accounts_ready"}
        onOpenChange={(o) => !o && closeModal()}
        title="Accounts ready"
        footer={
          readOnlyModal ? (
            <StageModalWaitingFooter />
          ) : (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={patch.isPending}
              onClick={() => patch.mutate({ markAccountsReady: true }, { onSuccess: closeModal })}
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
        <p className="text-xs text-muted-foreground">GitHub + static hosting for the client.</p>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "final_payment"}
        onOpenChange={(o) => !o && closeModal()}
        title="Due payment"
        footer={
          readOnlyModal ? (
            <StageModalWaitingFooter />
          ) : (
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={markPay.isPending}
              onClick={() => {
                const cents = parseRupeeInputToCents(dueRupees);
                if (cents == null) return;
                markPay.mutate({ kind: "FINAL", amountCents: cents }, { onSuccess: closeModal });
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
        <div className="space-y-2">
          <Label htmlFor="due">Amount (₹)</Label>
          <Input id="due" className="min-h-11" inputMode="decimal" value={dueRupees} onChange={(e) => setDueRupees(e.target.value)} />
        </div>
      </StageModalShell>

      <StageModalShell
        open={activeStage === "deployment_submit"}
        onOpenChange={(o) => !o && closeModal()}
        title="Live deployment"
        footer={
          readOnlyModal ? (
            <StageModalWaitingFooter />
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
          <p className="mb-2 text-xs text-amber-700 dark:text-amber-400">
            Available after admin verifies advance payment.
          </p>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="live-url">Live site URL</Label>
          <Input
            id="live-url"
            className="min-h-11"
            type="url"
            inputMode="url"
            placeholder="https://… or yourdomain.com"
            value={deployUrl}
            onChange={(e) => setDeployUrl(e.target.value)}
          />
        </div>
      </StageModalShell>

    </div>
  );
}
