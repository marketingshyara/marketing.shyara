import { describe, expect, it } from "vitest";
import { passwordCopy } from "./passwordCopy";

describe("passwordCopy", () => {
  it("uses distinct labels for admin temp vs user change vs forced set", () => {
    expect(passwordCopy.issueTemporaryPassword).not.toBe(passwordCopy.changePassword);
    expect(passwordCopy.setYourPassword).not.toBe(passwordCopy.changePassword);
    expect(passwordCopy.signInHelpTitle).toBe("Can't sign in?");
  });

  it("avoids forgot-password wording on login help", () => {
    const blob = [
      passwordCopy.signInHelpStep1,
      passwordCopy.signInHelpStep2,
      passwordCopy.signInHelpStep3
    ].join(" ");
    expect(blob.toLowerCase()).not.toContain("forgot password");
  });
});
