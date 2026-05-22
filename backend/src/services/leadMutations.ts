import type { User } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { HttpError } from "../errors/httpError.js";
import type { patchLeadBodySchema } from "../validators/schemas.js";
import type { z } from "zod";

export function assertSalesRepActor(user: User): void {
  if (user.role === UserRole.ADMIN) {
    throw new HttpError(403, "FORBIDDEN", "Sales rep access required.");
  }
}

type PatchLeadBody = z.infer<typeof patchLeadBodySchema>;

/** Rep-owned lead fields — admins must use verify/reject flows instead of PATCH. */
export const REP_ONLY_LEAD_PATCH_FIELDS = [
  "clientName",
  "clientEmail",
  "clientPhone",
  "notes",
  "agreedTotalCents",
  "advanceAmountCents",
  "finalQuoteCents",
  "websiteTemplateId",
  "whatsappGroupLink",
  "markDemoFinalized",
  "markAccountsReady"
] as const satisfies readonly (keyof PatchLeadBody)[];

/** True when the client sent this key (omit vs null vs value). Guards against Zod injecting omitted keys. */
export function wasPatchFieldSent(raw: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(raw, key) && raw[key] !== undefined;
}

/** Reject rep-only PATCH fields present in the raw request body (not Zod-parsed defaults). */
export function assertAdminLeadPatchBody(raw: Record<string, unknown>): void {
  for (const key of REP_ONLY_LEAD_PATCH_FIELDS) {
    if (wasPatchFieldSent(raw, key)) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        `Admins cannot update lead field "${key}"; use verification flows instead.`
      );
    }
  }
}
