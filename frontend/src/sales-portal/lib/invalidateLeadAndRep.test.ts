import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { qk } from "../queryKeys";
import { removeLeadFromTeamRepActiveCache, type TeamRepQueryData } from "./invalidateLeadAndRep";

describe("removeLeadFromTeamRepActiveCache", () => {
  it("removes project from active team-rep cache", () => {
    const qc = new QueryClient();
    const key = [...qk.teamRep("rep-1"), "active"] as const;
    qc.setQueryData(key, {
      rep: {
        id: "rep-1",
        email: "r@test.local",
        displayName: "Rep",
        totalLeads: 0,
        activeClients: 1,
        ongoingProjects: 1,
        pendingPayments: 0,
        needsAdminAction: 0
      },
      projects: [
        {
          id: "lead-a",
          clientName: "A",
          status: "DEPLOYED",
          agreedTotalCents: 100,
          convertedAt: "2026-01-01",
          currentStageKey: "commission",
          currentStageTitle: "Commission",
          pendingAdmin: true,
          pipelineStages: []
        },
        {
          id: "lead-b",
          clientName: "B",
          status: "BUILDING",
          agreedTotalCents: null,
          convertedAt: "2026-01-02",
          currentStageKey: "build_demo",
          currentStageTitle: "Demo",
          pendingAdmin: false,
          pipelineStages: []
        }
      ]
    });

    removeLeadFromTeamRepActiveCache(qc, "rep-1", "lead-a");
    const cached = qc.getQueryData<TeamRepQueryData>(key);
    expect(cached?.projects.map((p) => p.id)).toEqual(["lead-b"]);
  });
});
