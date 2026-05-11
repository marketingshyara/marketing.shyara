import type { Lead } from "@prisma/client";
import { LeadStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { assertLeadMutable } from "../src/services/leadGuards.js";
import { HttpError } from "../src/errors/httpError.js";
import { portalSettingsSchema } from "../src/validators/schemas.js";

const defaultSettings = portalSettingsSchema.parse({});

function leadStub(partial: Partial<Lead>): Lead {
  return partial as Lead;
}

describe("assertLeadMutable", () => {
  it("allows mutation when status is not terminal", () => {
    expect(() =>
      assertLeadMutable(leadStub({ status: LeadStatus.NEW }), defaultSettings)
    ).not.toThrow();
  });

  it("blocks mutation for COMMISSION_PAID by default", () => {
    expect(() =>
      assertLeadMutable(leadStub({ status: LeadStatus.COMMISSION_PAID }), defaultSettings)
    ).toThrow(HttpError);
  });
});
