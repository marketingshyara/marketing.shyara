import { describe, expect, it } from "vitest";
import {
  accountsReadyPatchSchema,
  githubProfileUrl,
  githubUsernameSchema
} from "./githubAccount";

describe("githubAccount", () => {
  it("accepts valid GitHub usernames", () => {
    expect(githubUsernameSchema.parse("acme-corp")).toBe("acme-corp");
    expect(githubUsernameSchema.parse("  Octo-Cat  ")).toBe("Octo-Cat");
  });

  it("rejects invalid GitHub usernames", () => {
    expect(() => githubUsernameSchema.parse("-bad")).toThrow();
    expect(() => githubUsernameSchema.parse("")).toThrow();
  });

  it("builds profile URL", () => {
    expect(githubProfileUrl("acme-corp")).toBe("https://github.com/acme-corp");
  });

  it("requires github fields when marking accounts ready", () => {
    const parsed = accountsReadyPatchSchema.parse({
      clientGithubId: "acme-corp",
      clientGithubEmail: "client@example.com",
      markAccountsReady: true
    });
    expect(parsed.clientGithubId).toBe("acme-corp");
    expect(parsed.markAccountsReady).toBe(true);
  });
});
