import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/client";
import { qk } from "../queryKeys";
import { errToast, invalidateQueryPrefixes } from "./useSalesQueries";
import { invalidateLeadAndRep } from "../lib/invalidateLeadAndRep";

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

describe("invalidateLeadAndRep", () => {
  it("invalidates lead detail, all team-rep tabs for rep, and team-reps", () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries").mockResolvedValue();
    invalidateLeadAndRep(qc, { leadId: "lead-a", repId: "rep-1" });
    expect(spy).toHaveBeenCalledWith({ queryKey: qk.lead("lead-a") });
    expect(spy).toHaveBeenCalledWith({ queryKey: qk.teamReps });
    const predicateCall = spy.mock.calls.find(
      (c) => typeof (c[0] as { predicate?: unknown }).predicate === "function"
    );
    expect(predicateCall).toBeDefined();
    const predicate = (predicateCall![0] as { predicate: (q: { queryKey: unknown }) => boolean })
      .predicate;
    expect(predicate({ queryKey: ["team-rep", "rep-1", "active"] })).toBe(true);
    expect(predicate({ queryKey: ["team-rep", "rep-1", "completed"] })).toBe(true);
    expect(predicate({ queryKey: ["team-rep", "other", "active"] })).toBe(false);
  });
});

describe("errToast CONCURRENT_MODIFICATION", () => {
  it("refreshes bounded query families instead of clearing entire cache", () => {
    const qc = new QueryClient();
    const spy = vi.spyOn(qc, "invalidateQueries").mockResolvedValue();
    errToast(new ApiError(409, "CONCURRENT_MODIFICATION", "Conflict"), qc);
    expect(spy.mock.calls.length).toBeGreaterThan(0);
    expect(spy.mock.calls.length).toBe(16);
    const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: string[] }).queryKey[0]);
    expect(keys).toContain("leads");
    expect(keys).toContain("session");
  });
});
