import { describe, expect, it } from "vitest";
import {
  prepareGithubRepoUrlForMutation,
  tryNormalizeGithubRepoUrl
} from "./githubRepoUrl";

describe("tryNormalizeGithubRepoUrl", () => {
  it("normalizes owner/repo paths", () => {
    expect(tryNormalizeGithubRepoUrl("github.com/acme/site")).toBe(
      "https://github.com/acme/site"
    );
  });
});

describe("prepareGithubRepoUrlForMutation", () => {
  it("throws when empty", () => {
    expect(() => prepareGithubRepoUrlForMutation("  ")).toThrow(/repository link/i);
  });

  it("returns canonical url when valid", () => {
    expect(prepareGithubRepoUrlForMutation("https://github.com/acme/site.git")).toBe(
      "https://github.com/acme/site"
    );
  });
});
