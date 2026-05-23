import { z } from "zod";
import { Prisma, type Lead } from "@prisma/client";
import type { PipelineStageKey } from "./pipeline.js";

/** Keys stored in Lead.stageDeclineNotes — pipeline stage keys that support decline. */
export type StageDeclineNoteKey =
  | "lead_capture"
  | "whatsapp_group"
  | "demo_finalized"
  | "accounts_ready"
  | "deployment_submit"
  | "deployment_verify"
  | "advance_verify"
  | "final_verify";

const stageDeclineEntrySchema = z.object({
  adminNote: z.string().max(2000).nullable(),
  declinedAt: z.string().datetime()
});

const stageDeclineNotesSchema = z.record(z.string(), stageDeclineEntrySchema);

export type StageDeclineNotesMap = z.infer<typeof stageDeclineNotesSchema>;
export type StageDeclineEntry = z.infer<typeof stageDeclineEntrySchema>;

/** API reject keys → pipeline stage keys for note storage. */
export const REJECT_KEY_TO_PIPELINE_STAGE: Record<string, StageDeclineNoteKey> = {
  whatsapp: "whatsapp_group",
  demo_finalized: "demo_finalized",
  accounts_ready: "accounts_ready",
  deployment: "deployment_verify",
  client_details: "lead_capture"
};

export function pipelineStageToDeclineKey(stageKey: PipelineStageKey): StageDeclineNoteKey | null {
  if (stageKey === "deployment_verify") return "deployment_verify";
  if (stageKey === "deployment_submit") return "deployment_submit";
  if (
    stageKey === "lead_capture" ||
    stageKey === "whatsapp_group" ||
    stageKey === "demo_finalized" ||
    stageKey === "accounts_ready" ||
    stageKey === "advance_verify" ||
    stageKey === "final_verify"
  ) {
    return stageKey;
  }
  return null;
}

export function parseStageDeclineNotes(lead: Pick<Lead, "stageDeclineNotes">): StageDeclineNotesMap {
  if (lead.stageDeclineNotes == null) return {};
  const parsed = stageDeclineNotesSchema.safeParse(lead.stageDeclineNotes);
  return parsed.success ? parsed.data : {};
}

export function getStageDeclineNote(
  lead: Pick<Lead, "stageDeclineNotes">,
  stageKey: StageDeclineNoteKey
): string | null {
  const map = parseStageDeclineNotes(lead);
  const entry = map[stageKey];
  if (!entry) return null;
  const trimmed = entry.adminNote?.trim();
  return trimmed ? trimmed : null;
}

export function stageDeclineNotesForUpdate(
  lead: Pick<Lead, "stageDeclineNotes">,
  stageKey: StageDeclineNoteKey,
  adminNote: string | null
): Prisma.InputJsonValue {
  const map = { ...parseStageDeclineNotes(lead) };
  map[stageKey] = {
    adminNote: adminNote?.trim() ? adminNote.trim() : null,
    declinedAt: new Date().toISOString()
  };
  return map as Prisma.InputJsonValue;
}

export function stageDeclineNotesAfterClear(
  lead: Pick<Lead, "stageDeclineNotes">,
  ...stageKeys: StageDeclineNoteKey[]
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  const map = { ...parseStageDeclineNotes(lead) };
  for (const stageKey of stageKeys) {
    delete map[stageKey];
    if (stageKey === "deployment_verify" || stageKey === "deployment_submit") {
      delete map.deployment_verify;
      delete map.deployment_submit;
    }
  }
  return Object.keys(map).length === 0 ? Prisma.DbNull : (map as Prisma.InputJsonValue);
}

export function declineNoteForPipelineEntry(entry: StageDeclineEntry | undefined): string | null | undefined {
  if (!entry) return undefined;
  const trimmed = entry.adminNote?.trim();
  return trimmed ? trimmed : null;
}

export async function persistStageDeclineNote(
  tx: Prisma.TransactionClient,
  leadId: string,
  lead: Pick<Lead, "stageDeclineNotes">,
  rejectApiKey: string,
  adminNote: string | null
): Promise<void> {
  const pipelineKey = REJECT_KEY_TO_PIPELINE_STAGE[rejectApiKey];
  if (!pipelineKey) return;
  if (rejectApiKey === "deployment") {
    const entry = {
      adminNote: adminNote?.trim() ? adminNote.trim() : null,
      declinedAt: new Date().toISOString()
    };
    const map = { ...parseStageDeclineNotes(lead), deployment_verify: entry, deployment_submit: entry };
    await tx.lead.updateMany({
      where: { id: leadId },
      data: { stageDeclineNotes: map as Prisma.InputJsonValue }
    });
    return;
  }
  await tx.lead.updateMany({
    where: { id: leadId },
    data: { stageDeclineNotes: stageDeclineNotesForUpdate(lead, pipelineKey, adminNote) }
  });
}

const VERIFY_KEY_TO_CLEAR: Record<string, StageDeclineNoteKey[]> = {
  whatsapp: ["whatsapp_group"],
  demo_finalized: ["demo_finalized"],
  accounts_ready: ["accounts_ready"],
  deployment: ["deployment_verify", "deployment_submit"],
  client_details: ["lead_capture"]
};

export async function clearStageDeclineNotesForVerify(
  tx: Prisma.TransactionClient,
  leadId: string,
  lead: Pick<Lead, "stageDeclineNotes">,
  verifyApiKey: string
): Promise<void> {
  const keys = VERIFY_KEY_TO_CLEAR[verifyApiKey];
  if (!keys?.length) return;
  await tx.lead.updateMany({
    where: { id: leadId },
    data: { stageDeclineNotes: stageDeclineNotesAfterClear(lead, ...keys) }
  });
}

export function latestRejectedPaymentAdminNote(
  lead: { payments?: { kind: string; verificationStatus: string; adminNote: string | null; markedAt: Date }[] },
  kind: "ADVANCE" | "FINAL"
): string | null | undefined {
  const rejected = lead.payments?.filter(
    (p) => p.kind === kind && p.verificationStatus === "REJECTED"
  );
  if (!rejected?.length) return undefined;
  const latest = [...rejected].sort(
    (a, b) => b.markedAt.getTime() - a.markedAt.getTime()
  )[0];
  const trimmed = latest?.adminNote?.trim();
  return trimmed ? trimmed : null;
}
