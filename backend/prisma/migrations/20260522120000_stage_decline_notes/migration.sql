-- Persist optional admin decline notes per pipeline stage on the lead.
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "stageDeclineNotes" JSONB;
