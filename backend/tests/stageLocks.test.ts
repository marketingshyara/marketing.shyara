import { describe, expect, it } from "vitest";
import { PaymentKind, PaymentVerificationStatus } from "@prisma/client";
import { HttpError } from "../src/errors/httpError.js";
import {
  assertRepDeploymentPatchAllowed,
  assertRepLeadPatchAllowed,
  assertRepMarkPaymentAllowed,
  clientDetailsReviewPending,
  repContactFieldsChanged
} from "../src/services/stageLocks.js";

function lead(overrides: Record<string, unknown> = {}) {
  return {
    id: "l1",
    clientName: "Acme",
    clientEmail: null,
    clientPhone: null,
    notes: null,
    convertedAt: null,
    whatsappVerifiedAt: null,
    demoFinalizedVerifiedAt: null,
    accountsReadyVerifiedAt: null,
    clientDetailsSubmittedAt: null,
    clientDetailsVerifiedAt: null,
    payments: [],
    ...overrides
  } as never;
}

describe("stageLocks", () => {
  it("blocks rep whatsapp patch after admin verify", () => {
    expect(() =>
      assertRepLeadPatchAllowed(
        lead({ whatsappVerifiedAt: new Date() }),
        { whatsappGroupLink: "https://chat.whatsapp.com/x" },
        { whatsappGroupLink: "https://chat.whatsapp.com/x" }
      )
    ).toThrow(HttpError);
    try {
      assertRepLeadPatchAllowed(
        lead({ whatsappVerifiedAt: new Date() }),
        { whatsappGroupLink: "https://chat.whatsapp.com/x" },
        { whatsappGroupLink: "https://chat.whatsapp.com/x" }
      );
    } catch (e) {
      expect((e as HttpError).code).toBe("STAGE_LOCKED");
    }
  });

  it("blocks deal pricing after convert", () => {
    expect(() =>
      assertRepLeadPatchAllowed(
        lead({ convertedAt: new Date() }),
        { agreedTotalCents: 100_00 },
        { agreedTotalCents: 100_00 }
      )
    ).toThrow(HttpError);
  });

  it("allows contact patch after convert and flags resubmit when values change", () => {
    const converted = lead({
      convertedAt: new Date(),
      clientDetailsVerifiedAt: new Date()
    });
    const result = assertRepLeadPatchAllowed(
      converted,
      { clientPhone: "9876543210" },
      { clientPhone: "9876543210" }
    );
    expect(result.resubmitClientDetails).toBe(true);
  });

  it("does not flag resubmit when contact values unchanged", () => {
    const converted = lead({
      convertedAt: new Date(),
      clientPhone: "9876543210",
      clientDetailsVerifiedAt: new Date()
    });
    const result = assertRepLeadPatchAllowed(
      converted,
      { clientPhone: "9876543210" },
      { clientPhone: "9876543210" }
    );
    expect(result.resubmitClientDetails).toBe(false);
  });

  it("blocks contact patch while client details review is pending", () => {
    expect(() =>
      assertRepLeadPatchAllowed(
        lead({
          convertedAt: new Date(),
          clientDetailsSubmittedAt: new Date(),
          clientDetailsVerifiedAt: null
        }),
        { clientName: "New Name" },
        { clientName: "New Name" }
      )
    ).toThrow(HttpError);
  });

  it("assertRepMarkPaymentAllowed rejects verified payment kind", () => {
    expect(() =>
      assertRepMarkPaymentAllowed(
        lead({
          payments: [
            {
              kind: PaymentKind.ADVANCE,
              verificationStatus: PaymentVerificationStatus.VERIFIED
            }
          ]
        }),
        PaymentKind.ADVANCE
      )
    ).toThrow(HttpError);
  });

  it("assertRepDeploymentPatchAllowed rejects verified deployment", () => {
    expect(() =>
      assertRepDeploymentPatchAllowed({ deploymentVerifiedAt: new Date() })
    ).toThrow(HttpError);
  });

  it("repContactFieldsChanged detects email change", () => {
    expect(
      repContactFieldsChanged(
        lead({ clientEmail: "a@b.com" }),
        { clientEmail: "c@d.com" },
        { clientEmail: "c@d.com" }
      )
    ).toBe(true);
  });

  it("clientDetailsReviewPending", () => {
    expect(
      clientDetailsReviewPending({
        clientDetailsSubmittedAt: new Date(),
        clientDetailsVerifiedAt: null
      })
    ).toBe(true);
    expect(
      clientDetailsReviewPending({
        clientDetailsSubmittedAt: new Date(),
        clientDetailsVerifiedAt: new Date()
      })
    ).toBe(false);
  });
});
