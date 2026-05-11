import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/client";
import { errToast, invalidateQueryPrefixes } from "./useSalesQueries";

describe("invalidateQueryPrefixes", () => {
  it("issues one invalidateQueries per prefix", () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries").mockResolvedValue();
    invalidateQueryPrefixes(qc, ["leads", "lead", "commissions"]);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenCalledWith({ queryKey: ["leads"] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["lead"] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ["commissions"] });
  });
});

describe("errToast CONCURRENT_MODIFICATION", () => {
  it("refreshes bounded query families instead of clearing entire cache", () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries").mockResolvedValue();
    errToast(new ApiError(409, "CONCURRENT_MODIFICATION", "Conflict"), qc);
    expect(spy.mock.calls.length).toBeGreaterThan(0);
    expect(spy.mock.calls.length).toBeLessThanOrEqual(15);
    const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: string[] }).queryKey[0]);
    expect(keys).toContain("leads");
    expect(keys).toContain("session");
  });
});
