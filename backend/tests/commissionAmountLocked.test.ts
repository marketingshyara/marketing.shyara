import { describe, expect, it } from "vitest";
import { patchCommissionBodySchema } from "../src/validators/schemas.js";

describe("PATCH commission amount lock", () => {
  it("parses body shape for API contract", () => {
    expect(patchCommissionBodySchema.parse({ amountCents: 1000 })).toEqual({
      amountCents: 1000
    });
  });
});
