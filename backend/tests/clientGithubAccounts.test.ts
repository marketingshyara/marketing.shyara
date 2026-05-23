import { describe, expect, it } from "vitest";
import { githubUsernameSchema, patchLeadBodySchema } from "../src/validators/schemas.js";

describe("patchLeadBodySchema clientGithub fields", () => {
  it("accepts github username and email on patch", () => {
    const body = patchLeadBodySchema.parse({
      clientGithubId: "acme-corp",
      clientGithubEmail: "client@example.com",
      markAccountsReady: true
    });
    expect(body.clientGithubId).toBe("acme-corp");
    expect(body.clientGithubEmail).toBe("client@example.com");
  });

  it("rejects invalid github username", () => {
    expect(() =>
      patchLeadBodySchema.parse({
        clientGithubId: "-invalid",
        clientGithubEmail: "client@example.com"
      })
    ).toThrow();
  });
});

describe("githubUsernameSchema", () => {
  it("trims username", () => {
    expect(githubUsernameSchema.parse("  my-org  ")).toBe("my-org");
  });
});
