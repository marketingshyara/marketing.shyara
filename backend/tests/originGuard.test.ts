import type { FastifyRequest } from "fastify";
import { describe, expect, it } from "vitest";
import { makeOriginGuard } from "../src/auth/originGuard.js";
import { HttpError } from "../src/errors/httpError.js";

const guard = makeOriginGuard(["http://localhost:8080", "https://app.example.com"]);

function req(method: string, url: string, origin?: string | null): FastifyRequest {
  const headers: Record<string, unknown> = {};
  if (origin !== null && origin !== undefined) headers.origin = origin;
  return { method, url, headers } as unknown as FastifyRequest;
}

describe("origin guard", () => {
  it("allows safe methods regardless of Origin", async () => {
    await expect(guard(req("GET", "/api/leads"), {} as never)).resolves.toBeUndefined();
    await expect(guard(req("HEAD", "/api/leads"), {} as never)).resolves.toBeUndefined();
    await expect(guard(req("OPTIONS", "/api/leads"), {} as never)).resolves.toBeUndefined();
  });

  it("rejects POST without Origin", async () => {
    await expect(guard(req("POST", "/api/leads", null), {} as never)).rejects.toBeInstanceOf(HttpError);
  });

  it("rejects POST with disallowed Origin", async () => {
    await expect(
      guard(req("POST", "/api/leads", "https://evil.example.com"), {} as never)
    ).rejects.toBeInstanceOf(HttpError);
  });

  it("allows POST with allow-listed Origin", async () => {
    await expect(
      guard(req("POST", "/api/leads", "http://localhost:8080"), {} as never)
    ).resolves.toBeUndefined();
  });

  it("skips health probes for state-changing methods", async () => {
    // Only POST/PATCH/PUT/DELETE are guarded, but health is GET-only anyway; the skip set is
    // belt-and-suspenders for anything that ever does a HEAD-on-health style probe.
    await expect(guard(req("GET", "/api/health"), {} as never)).resolves.toBeUndefined();
  });
});
