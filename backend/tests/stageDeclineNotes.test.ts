import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  declineNoteForPipelineEntry,
  parseStageDeclineNotes,
  REJECT_KEY_TO_PIPELINE_STAGE,
  stageDeclineNotesAfterClear,
  stageDeclineNotesForUpdate
} from "../src/services/stageDeclineNotes.js";

describe("stageDeclineNotes", () => {
  it("maps reject API keys to pipeline stage keys", () => {
    expect(REJECT_KEY_TO_PIPELINE_STAGE.accounts_ready).toBe("accounts_ready");
    expect(REJECT_KEY_TO_PIPELINE_STAGE.deployment).toBe("deployment_verify");
  });

  it("stores and parses decline entries", () => {
    const lead = {
      stageDeclineNotes: stageDeclineNotesForUpdate(
        { stageDeclineNotes: null },
        "accounts_ready",
        "Wrong org"
      )
    };
    const map = parseStageDeclineNotes(lead);
    expect(map.accounts_ready?.adminNote).toBe("Wrong org");
    expect(declineNoteForPipelineEntry(map.accounts_ready)).toBe("Wrong org");
    expect(declineNoteForPipelineEntry(map.demo_finalized)).toBeUndefined();
  });

  it("clears deployment keys together", () => {
    const lead = {
      stageDeclineNotes: {
        deployment_verify: { adminNote: "Bad URL", declinedAt: new Date().toISOString() },
        deployment_submit: { adminNote: "Bad URL", declinedAt: new Date().toISOString() }
      }
    };
    const cleared = stageDeclineNotesAfterClear(lead, "deployment_verify");
    expect(cleared).toBe(Prisma.DbNull);
    expect(parseStageDeclineNotes({ stageDeclineNotes: null })).toEqual({});
  });

  it("returns null display note when declined without written note", () => {
    const entry = { adminNote: null, declinedAt: new Date().toISOString() };
    expect(declineNoteForPipelineEntry(entry)).toBeNull();
  });
});
