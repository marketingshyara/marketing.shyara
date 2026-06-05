import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Lead } from "../../types";
import { RestoreLeadButton } from "./RestoreLeadButton";

type Props = {
  lead: Lead;
  onRestored?: () => void;
  /** Admin timeline opens read-only; only the rep can restore. */
  actorMode?: "rep" | "admin";
};

export function NotInterestedArchiveBanner({ lead, onRestored, actorMode = "rep" }: Props) {
  if (lead.notInterestedAt == null) return null;

  return (
    <div
      className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3"
      role="status"
    >
      <div className="space-y-1 text-sm text-amber-950 dark:text-amber-100">
        <p className="font-medium">Marked not interested</p>
        <p className="text-amber-900/90 dark:text-amber-100/90">
          {actorMode === "admin"
            ? "Archived by the rep. They must restore it to their Prospects list before pipeline work can continue."
            : "Hidden from your active Prospects list. Restore to continue working this prospect."}
        </p>
        <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
          Marked {format(new Date(lead.notInterestedAt), "d MMM yyyy, h:mm a")}
        </p>
        {lead.notInterestedNote ? (
          <p className="text-sm">
            <span className="font-medium">Note:</span> {lead.notInterestedNote}
          </p>
        ) : null}
      </div>
      {actorMode === "rep" ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <RestoreLeadButton
            leadId={lead.id}
            clientName={lead.clientName}
            onRestored={onRestored}
          />
          <Button asChild variant="ghost" className="min-h-11">
            <Link to="/portal/pipeline/not-interested">View not interested list</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
