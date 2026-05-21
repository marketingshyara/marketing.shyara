import { describe, expect, it } from "vitest";
import { tryNormalizeHttpUrl } from "../src/lib/httpUrl.js";
import { patchLeadBodySchema } from "../src/validators/schemas.js";

describe("tryNormalizeHttpUrl", () => {
  it("returns null for empty input", () => {
    expect(tryNormalizeHttpUrl("")).toBeNull();
    expect(tryNormalizeHttpUrl("   ")).toBeNull();
  });

  it("prepends https when scheme missing", () => {
    expect(tryNormalizeHttpUrl("example.com/path")).toBe("https://example.com/path");
    expect(tryNormalizeHttpUrl("marketing.shyara.co.in/samples")).toBe(
      "https://marketing.shyara.co.in/samples"
    );
  });

  it("preserves explicit https", () => {
    expect(tryNormalizeHttpUrl("https://preview.example/demo")).toBe(
      "https://preview.example/demo"
    );
  });

  it("returns null for invalid hosts", () => {
    expect(tryNormalizeHttpUrl("not a url!!!")).toBeNull();
  });
});

describe("patchLeadBodySchema previewUrl", () => {
  it("accepts host without scheme", () => {
    const body = patchLeadBodySchema.parse({ previewUrl: "example.com/demo" });
    expect(body.previewUrl).toBe("https://example.com/demo");
  });

  it("clears with null", () => {
    const body = patchLeadBodySchema.parse({ previewUrl: null });
    expect(body.previewUrl).toBeNull();
  });

  it("does not inject whatsappGroupLink when only previewUrl is sent", () => {
    const body = patchLeadBodySchema.parse({ previewUrl: "test.com" });
    expect(body.previewUrl).toBe("https://test.com/");
    expect(body).not.toHaveProperty("whatsappGroupLink");
  });
});
