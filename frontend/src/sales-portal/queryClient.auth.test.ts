import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  confirmSessionThenRedirectForTest,
  resetAuthRedirectStateForTest
} from "./queryClient";
import { qk } from "./queryKeys";

const assignMock = vi.fn();

function mockFetchJson(body: unknown) {
  const payload = JSON.stringify(body);
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers({ "content-type": "application/json" }),
    text: async () => payload,
    json: async () => body
  });
}

describe("confirmSessionThenRedirect", () => {
  beforeEach(() => {
    resetAuthRedirectStateForTest();
    assignMock.mockReset();
    vi.stubGlobal("location", {
      pathname: "/portal/pipeline",
      search: "",
      assign: assignMock
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetAuthRedirectStateForTest();
  });

  it("does not redirect when session probe still has a user", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetchJson({
        user: { id: "u1", email: "a@b.c", role: "ADMIN", mustChangePassword: false }
      })
    );
    const client = new QueryClient();
    client.setQueryData(qk.session, {
      user: { id: "u1", email: "a@b.c", role: "ADMIN", mustChangePassword: false }
    });
    await confirmSessionThenRedirectForTest(client);
    expect(assignMock).not.toHaveBeenCalled();
    expect(client.getQueryData(qk.session)).toMatchObject({ user: { id: "u1" } });
  });

  it("redirects when session probe returns null user", async () => {
    vi.stubGlobal("fetch", mockFetchJson({ user: null }));
    const client = new QueryClient();
    await confirmSessionThenRedirectForTest(client);
    expect(assignMock).toHaveBeenCalled();
    expect(String(assignMock.mock.calls[0][0])).toContain("/portal/login");
    expect(client.getQueryData(qk.session)).toEqual({ user: null });
  });
});
