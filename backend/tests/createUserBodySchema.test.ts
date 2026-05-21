import { describe, expect, it } from "vitest";
import { UserRole } from "@prisma/client";
import { createUserBodySchema } from "../src/validators/schemas.js";

describe("createUserBodySchema", () => {
  it("accepts ADMIN role", () => {
    const parsed = createUserBodySchema.parse({
      email: "NewAdmin@test.local",
      role: "ADMIN"
    });
    expect(parsed.role).toBe(UserRole.ADMIN);
    expect(parsed.email).toBe("newadmin@test.local");
  });

  it("treats empty password and displayName as omitted", () => {
    const parsed = createUserBodySchema.parse({
      email: "rep@test.local",
      role: "SALES_REP",
      password: "",
      displayName: ""
    });
    expect(parsed.password).toBeUndefined();
    expect(parsed.displayName).toBeUndefined();
  });
});
