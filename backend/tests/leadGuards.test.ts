import type { Lead } from "@prisma/client";
import { LeadStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { assertLeadMutableForOp } from "../src/services/leadGuards.js";
import { HttpError } from "../src/errors/httpError.js";
import { portalSettingsSchema } from "../src/validators/schemas.js";

const defaultSettings = portalSettingsSchema.parse({});

function leadStub(partial: Partial<Lead>): Lead {
  return partial as Lead;
}

describe("assertLeadMutableForOp", () => {
  it("allows mutation when status is not terminal", () => {
    expect(() =>
      assertLeadMutableForOp(leadStub({ status: LeadStatus.NEW }), defaultSettings, "PATCH_FIELDS")
    ).not.toThrow();
  });

  it("blocks mutation for COMMISSION_PAID by default", () => {
    expect(() =>
      assertLeadMutableForOp(
        leadStub({ status: LeadStatus.COMMISSION_PAID }),
        defaultSettings,
        "PATCH_FIELDS"
      )
    ).toThrow(HttpError);
  });
});
