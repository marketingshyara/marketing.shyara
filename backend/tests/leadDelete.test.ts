import { describe, expect, it } from "vitest";
import {
  LeadStatus,
  PaymentVerificationStatus
} from "@prisma/client";
import { assertLeadDeletable } from "../src/services/leadGuards.js";
import { HttpError } from "../src/errors/httpError.js";

describe("assertLeadDeletable", () => {
  const base = {
    convertedAt: null,
    status: LeadStatus.NEW,
    payments: [] as { verificationStatus: PaymentVerificationStatus }[],
    project: null
  };

  it("allows unconverted prospect with no verified payments or project", () => {
    expect(() => assertLeadDeletable(base)).not.toThrow();
  });

  it("rejects converted clients", () => {
    expect(() =>
      assertLeadDeletable({ ...base, convertedAt: new Date() })
    ).toThrow(HttpError);
    try {
      assertLeadDeletable({ ...base, convertedAt: new Date() });
    } catch (e) {
      expect((e as HttpError).code).toBe("LEAD_ALREADY_CONVERTED");
    }
  });

  it("rejects when a payment is verified", () => {
    expect(() =>
      assertLeadDeletable({
        ...base,
        payments: [{ verificationStatus: PaymentVerificationStatus.VERIFIED }]
      })
    ).toThrow(HttpError);
    try {
      assertLeadDeletable({
        ...base,
        payments: [{ verificationStatus: PaymentVerificationStatus.VERIFIED }]
      });
    } catch (e) {
      expect((e as HttpError).code).toBe("LEAD_HAS_VERIFIED_PAYMENT");
    }
  });

  it("rejects when project exists", () => {
    expect(() =>
      assertLeadDeletable({ ...base, project: { id: "proj-1" } })
    ).toThrow(HttpError);
    try {
      assertLeadDeletable({ ...base, project: { id: "proj-1" } });
    } catch (e) {
      expect((e as HttpError).code).toBe("LEAD_HAS_PROJECT");
    }
  });
});
