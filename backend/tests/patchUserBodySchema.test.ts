import { describe, expect, it } from "vitest";
import { patchUserBodySchema } from "../src/validators/schemas.js";

describe("patchUserBodySchema", () => {
  it("accepts null displayName to clear", () => {
    const parsed = patchUserBodySchema.parse({
      displayName: null,
      role: "SALES_REP",
      isActive: true
    });
    expect(parsed.displayName).toBeNull();
  });

  it("accepts non-empty displayName", () => {
    const parsed = patchUserBodySchema.parse({ displayName: "Ada" });
    expect(parsed.displayName).toBe("Ada");
  });

  it("rejects empty string displayName", () => {
    expect(() => patchUserBodySchema.parse({ displayName: "" })).toThrow();
  });
});
