import { describe, expect, it } from "vitest";
import { sampleAssetUrl } from "./sampleAssetUrl";

describe("sampleAssetUrl", () => {
  it("returns absolute paths unchanged when base is root", () => {
    expect(sampleAssetUrl("/samples/websites/foo/poster.jpg")).toBe(
      "/samples/websites/foo/poster.jpg"
    );
  });
});
