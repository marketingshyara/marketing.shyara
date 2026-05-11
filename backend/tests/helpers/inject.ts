import type { FastifyInstance } from "fastify";
import type { InjectOptions, Response } from "light-my-request";

/**
 * Wrapper around `app.inject` that injects a default Origin header matching the test config's
 * default ALLOWED_ORIGINS value. The CSRF origin guard rejects state-changing requests without
 * an Origin, so every POST/PATCH/PUT/DELETE in our tests has to include one. Tests that want to
 * exercise the guard itself can pass a custom origin (or null) explicitly.
 */
export const DEFAULT_TEST_ORIGIN = "http://localhost:8080";

export function inject(app: FastifyInstance, opts: InjectOptions): Promise<Response> {
  const headers = { ...(opts.headers ?? {}) } as Record<string, string | undefined>;
  if (!("origin" in headers) && !("Origin" in headers)) {
    headers.origin = DEFAULT_TEST_ORIGIN;
  }
  return app.inject({ ...opts, headers: headers as InjectOptions["headers"] });
}
