import { describe, expect, it } from "vitest";
import { UserRole } from "@prisma/client";
import { assertAdminLeadPatchBody, assertSalesRepActor } from "../src/services/leadMutations.js";
import { patchLeadBodySchema } from "../src/validators/schemas.js";
import { HttpError } from "../src/errors/httpError.js";

describe("admin rep mutation guards", () => {
  const admin = { id: "a1", role: UserRole.ADMIN } as const;
  const rep = { id: "r1", role: UserRole.SALES_REP } as const;

  it("assertSalesRepActor rejects admin", () => {
    expect(() => assertSalesRepActor(admin as never)).toThrow(HttpError);
    try {
      assertSalesRepActor(admin as never);
    } catch (e) {
      expect((e as HttpError).statusCode).toBe(403);
      expect((e as HttpError).code).toBe("FORBIDDEN");
    }
  });

  it("assertSalesRepActor allows rep", () => {
    expect(() => assertSalesRepActor(rep as never)).not.toThrow();
  });

  it("assertAdminLeadPatchBody rejects rep-only fields", () => {
    expect(() =>
      assertAdminLeadPatchBody({ clientName: "Acme" })
    ).toThrow(HttpError);
    expect(() =>
      assertAdminLeadPatchBody({ whatsappGroupLink: "https://chat.whatsapp.com/x" })
    ).toThrow(HttpError);
  });

  it("assertAdminLeadPatchBody allows admin fields", () => {
    expect(() =>
      assertAdminLeadPatchBody({ assignedToUserId: "rep-1", previewUrl: "https://preview.example" })
    ).not.toThrow();
    expect(() => assertAdminLeadPatchBody({})).not.toThrow();
  });

  it("allows admin previewUrl-only PATCH after schema parse", () => {
    const body = patchLeadBodySchema.parse({ previewUrl: "test.com" });
    expect(() => assertAdminLeadPatchBody(body)).not.toThrow();
  });
});
