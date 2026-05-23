import { describe, expect, it } from "vitest";
import { tryNormalizeGithubRepoUrl } from "../src/lib/githubRepoUrl.js";
import { verifyRepoTransferBodySchema } from "../src/validators/schemas.js";

describe("tryNormalizeGithubRepoUrl", () => {
  it("normalizes github.com/owner/repo", () => {
    expect(tryNormalizeGithubRepoUrl("github.com/acme-corp/website")).toBe(
      "https://github.com/acme-corp/website"
    );
  });

  it("strips .git suffix and extra path segments", () => {
    expect(tryNormalizeGithubRepoUrl("https://github.com/acme/website.git/tree/main")).toBe(
      "https://github.com/acme/website"
    );
  });

  it("rejects non-github hosts", () => {
    expect(tryNormalizeGithubRepoUrl("https://gitlab.com/acme/website")).toBeNull();
  });
});

describe("verifyRepoTransferBodySchema", () => {
  it("requires a valid github repo url", () => {
    const parsed = verifyRepoTransferBodySchema.parse({
      transferredGithubRepoUrl: "github.com/client/site"
    });
    expect(parsed.transferredGithubRepoUrl).toBe("https://github.com/client/site");
  });
});
