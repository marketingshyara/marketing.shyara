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

const REP_ONLY_PATCH_FIELDS: (keyof PatchLeadBody)[] = [
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
];

export function assertAdminLeadPatchBody(body: PatchLeadBody): void {
  for (const key of REP_ONLY_PATCH_FIELDS) {
    if (body[key] !== undefined) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        `Admins cannot update lead field "${key}"; use verification flows instead.`
      );
    }
  }
}
