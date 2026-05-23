import {
  PaymentKind,
  PaymentVerificationStatus,
  type Lead,
  type LeadPayment,
  type Project
} from "@prisma/client";
import { HttpError } from "../errors/httpError.js";
import { wasPatchFieldSent } from "./leadMutations.js";
import type { patchLeadBodySchema } from "../validators/schemas.js";
import type { z } from "zod";

type PatchLeadBody = z.infer<typeof patchLeadBodySchema>;

export type RepPatchLockLead = Lead & {
  payments: Pick<LeadPayment, "kind" | "verificationStatus">[];
};

function stageLocked(stageLabel: string): never {
  throw new HttpError(
    403,
    "STAGE_LOCKED",
    `${stageLabel} was approved by admin. Ask admin to decline this step before making changes.`
  );
}

function hasVerifiedPayment(lead: RepPatchLockLead, kind: PaymentKind): boolean {
  return lead.payments.some(
    (p) => p.kind === kind && p.verificationStatus === PaymentVerificationStatus.VERIFIED
  );
}

function dealPricingLocked(lead: RepPatchLockLead): boolean {
  return !!lead.convertedAt || hasVerifiedPayment(lead, PaymentKind.ADVANCE);
}

const DEAL_PRICING_FIELDS = [
  "agreedTotalCents",
  "advanceAmountCents",
  "finalQuoteCents",
  "websiteTemplateId"
] as const;

const CONTACT_FIELDS = ["clientName", "clientEmail", "clientPhone", "notes"] as const;

function normalizeOptionalString(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** True when rep sent a contact field that differs from stored values. */
export function repContactFieldsChanged(
  lead: Lead,
  rawBody: Record<string, unknown>,
  body: PatchLeadBody
): boolean {
  if (wasPatchFieldSent(rawBody, "clientName") && body.clientName !== undefined) {
    if (body.clientName.trim() !== lead.clientName.trim()) return true;
  }
  if (wasPatchFieldSent(rawBody, "clientEmail") && body.clientEmail !== undefined) {
    const next = normalizeOptionalString(body.clientEmail);
    const prev = normalizeOptionalString(lead.clientEmail);
    if (next !== prev) return true;
  }
  if (wasPatchFieldSent(rawBody, "clientPhone") && body.clientPhone !== undefined) {
    const next = normalizeOptionalString(body.clientPhone);
    const prev = normalizeOptionalString(lead.clientPhone);
    if (next !== prev) return true;
  }
  if (wasPatchFieldSent(rawBody, "notes") && body.notes !== undefined) {
    const next = normalizeOptionalString(body.notes);
    const prev = normalizeOptionalString(lead.notes);
    if (next !== prev) return true;
  }
  return false;
}

export function clientDetailsReviewPending(lead: Pick<Lead, "clientDetailsSubmittedAt" | "clientDetailsVerifiedAt">): boolean {
  return !!lead.clientDetailsSubmittedAt && !lead.clientDetailsVerifiedAt;
}

/** Rep-only PATCH guards for admin-verified stages and deal pricing locks. */
export function assertRepLeadPatchAllowed(
  lead: RepPatchLockLead,
  rawBody: Record<string, unknown>,
  body: PatchLeadBody
): { resubmitClientDetails: boolean } {
  if (wasPatchFieldSent(rawBody, "whatsappGroupLink") && lead.whatsappVerifiedAt) {
    stageLocked("WhatsApp group");
  }

  if (wasPatchFieldSent(rawBody, "markDemoFinalized") && lead.demoFinalizedVerifiedAt) {
    stageLocked("Client demo approval");
  }

  const accountsGithubPatch =
    wasPatchFieldSent(rawBody, "markAccountsReady") ||
    wasPatchFieldSent(rawBody, "clientGithubId") ||
    wasPatchFieldSent(rawBody, "clientGithubEmail");
  if (accountsGithubPatch && lead.accountsReadyVerifiedAt) {
    stageLocked("Accounts ready");
  }

  if (dealPricingLocked(lead)) {
    for (const key of DEAL_PRICING_FIELDS) {
      if (wasPatchFieldSent(rawBody, key)) {
        stageLocked("Deal pricing");
      }
    }
  }

  let resubmitClientDetails = false;
  if (lead.convertedAt) {
    const contactPatch = CONTACT_FIELDS.some((k) => wasPatchFieldSent(rawBody, k));
    if (contactPatch) {
      if (clientDetailsReviewPending(lead)) {
        stageLocked("Client details");
      }
      if (repContactFieldsChanged(lead, rawBody, body)) {
        resubmitClientDetails = true;
      }
    }
  }

  return { resubmitClientDetails };
}

export function assertRepMarkPaymentAllowed(
  lead: RepPatchLockLead,
  kind: PaymentKind
): void {
  if (
    lead.payments.some(
      (p) => p.kind === kind && p.verificationStatus === PaymentVerificationStatus.VERIFIED
    )
  ) {
    throw new HttpError(
      409,
      "STAGE_LOCKED",
      `${kind === PaymentKind.ADVANCE ? "Advance" : "Due"} payment was already verified by admin. Ask admin to decline the payment review before submitting again.`
    );
  }
}

export function assertRepDeploymentPatchAllowed(project: Pick<Project, "deploymentVerifiedAt">): void {
  if (project.deploymentVerifiedAt) {
    stageLocked("Live deployment");
  }
}
