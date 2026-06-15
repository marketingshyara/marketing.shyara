import { describe, expect, it } from "vitest";
import {
  LeadStatus,
  PaymentVerificationStatus,
  ProspectCategory
} from "@prisma/client";
import {
  assertLeadDeletable,
  assertLeadMutable,
  assertLeadNotInterestedEligible
} from "../src/services/leadGuards.js";
import type { PortalSettingsValues } from "../src/validators/schemas.js";
import { HttpError } from "../src/errors/httpError.js";

describe("assertLeadNotInterestedEligible", () => {
  const base = {
    convertedAt: null,
    status: LeadStatus.NEW,
    payments: [] as { verificationStatus: PaymentVerificationStatus }[],
    project: null
  };

  it("allows unconverted prospect with no verified payments or project", () => {
    expect(() => assertLeadNotInterestedEligible(base)).not.toThrow();
  });

  it("rejects converted clients", () => {
    expect(() =>
      assertLeadNotInterestedEligible({ ...base, convertedAt: new Date() })
    ).toThrow(HttpError);
    try {
      assertLeadNotInterestedEligible({ ...base, convertedAt: new Date() });
    } catch (e) {
      expect((e as HttpError).code).toBe("LEAD_ALREADY_CONVERTED");
    }
  });

  it("rejects when a payment is verified", () => {
    expect(() =>
      assertLeadNotInterestedEligible({
        ...base,
        payments: [{ verificationStatus: PaymentVerificationStatus.VERIFIED }]
      })
    ).toThrow(HttpError);
    try {
      assertLeadNotInterestedEligible({
        ...base,
        payments: [{ verificationStatus: PaymentVerificationStatus.VERIFIED }]
      });
    } catch (e) {
      expect((e as HttpError).code).toBe("LEAD_HAS_VERIFIED_PAYMENT");
    }
  });

  it("rejects when project exists", () => {
    expect(() =>
      assertLeadNotInterestedEligible({ ...base, project: { id: "proj-1" } })
    ).toThrow(HttpError);
    try {
      assertLeadNotInterestedEligible({ ...base, project: { id: "proj-1" } });
    } catch (e) {
      expect((e as HttpError).code).toBe("LEAD_HAS_PROJECT");
    }
  });
});

describe("assertLeadDeletable", () => {
  const base = {
    convertedAt: null,
    status: LeadStatus.NEW,
    payments: [] as { verificationStatus: PaymentVerificationStatus }[],
    project: null
  };

  it("allows not-interested archived prospects", () => {
    expect(() =>
      assertLeadDeletable({
        ...base,
        prospectCategory: ProspectCategory.NOT_INTERESTED
      } as Parameters<typeof assertLeadDeletable>[0] & {
        prospectCategory: ProspectCategory;
      })
    ).not.toThrow();
  });
});

describe("assertLeadMutable on not interested prospects", () => {
  const settings = {
    terminalNoMutationStatuses: [LeadStatus.COMMISSION_PAID]
  } as PortalSettingsValues;

  it("blocks mutations on archived unconverted prospects", () => {
    expect(() =>
      assertLeadMutable(
        {
          status: LeadStatus.NEW,
          convertedAt: null,
          prospectCategory: ProspectCategory.NOT_INTERESTED
        } as Parameters<typeof assertLeadMutable>[0],
        settings
      )
    ).toThrow(HttpError);
    try {
      assertLeadMutable(
        {
          status: LeadStatus.NEW,
          convertedAt: null,
          prospectCategory: ProspectCategory.NOT_INTERESTED
        } as Parameters<typeof assertLeadMutable>[0],
        settings
      );
    } catch (e) {
      expect((e as HttpError).code).toBe("LEAD_NOT_INTERESTED");
    }
  });
});
