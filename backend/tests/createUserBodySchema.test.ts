import { describe, expect, it } from "vitest";
import { CommissionModel, UserRole } from "@prisma/client";
import { createUserBodySchema, patchUserBodySchema } from "../src/validators/schemas.js";

describe("createUserBodySchema", () => {
  it("accepts ADMIN role", () => {
    const parsed = createUserBodySchema.parse({
      email: "NewAdmin@test.local",
      role: "ADMIN"
    });
    expect(parsed.role).toBe(UserRole.ADMIN);
    expect(parsed.email).toBe("newadmin@test.local");
  });

  it("requires commissionModel for SALES_REP", () => {
    expect(() =>
      createUserBodySchema.parse({
        email: "rep@test.local",
        role: "SALES_REP"
      })
    ).toThrow();
    const parsed = createUserBodySchema.parse({
      email: "rep@test.local",
      role: "SALES_REP",
      commissionModel: "MODEL_B"
    });
    expect(parsed.commissionModel).toBe(CommissionModel.MODEL_B);
  });

  it("rejects commissionModel on ADMIN create", () => {
    expect(() =>
      createUserBodySchema.parse({
        email: "admin@test.local",
        role: "ADMIN",
        commissionModel: "MODEL_A"
      })
    ).toThrow();
  });

  it("treats empty password and displayName as omitted", () => {
    const parsed = createUserBodySchema.parse({
      email: "rep@test.local",
      role: "SALES_REP",
      commissionModel: "MODEL_A",
      password: "",
      displayName: ""
    });
    expect(parsed.password).toBeUndefined();
    expect(parsed.displayName).toBeUndefined();
  });
});

describe("patchUserBodySchema", () => {
  it("rejects commissionModel when role is ADMIN", () => {
    expect(() =>
      patchUserBodySchema.parse({
        role: "ADMIN",
        commissionModel: "MODEL_A"
      })
    ).toThrow();
  });
});
