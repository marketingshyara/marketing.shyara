import { describe, expect, it } from "vitest";
import { isUserAuthenticatable } from "../src/services/userAuth.js";

describe("isUserAuthenticatable", () => {
  it("allows active non-archived users", () => {
    expect(isUserAuthenticatable({ isActive: true, archivedAt: null })).toBe(true);
  });

  it("rejects inactive users", () => {
    expect(isUserAuthenticatable({ isActive: false, archivedAt: null })).toBe(false);
  });

  it("rejects archived users even if isActive were true", () => {
    expect(isUserAuthenticatable({ isActive: true, archivedAt: new Date() })).toBe(false);
  });
});
