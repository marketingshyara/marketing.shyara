import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Lead } from "../../types";
import { RestoreLeadButton } from "./RestoreLeadButton";
import { cn } from "@/lib/utils";
import { PORTAL_WAITING_BANNER, PORTAL_WAITING_TEXT } from "../../theme/statusColors";

type Props = {
  lead: Lead;
  onRestored?: () => void;
  /** Admin timeline opens read-only; only the rep can restore. */
  actorMode?: "rep" | "admin";
};

export function NotInterestedArchiveBanner({ lead, onRestored, actorMode = "rep" }: Props) {
  if (lead.notInterestedAt == null) return null;

  return (
    <div className={cn("space-y-3 px-4 py-3 shadow-[2px_2px_0_0_#0A0A0A]", PORTAL_WAITING_BANNER)} role="status">
      <div className={cn("space-y-1 text-sm", PORTAL_WAITING_TEXT)}>
        <p className="font-bold uppercase tracking-wide text-[#0A0A0A]">Marked not interested</p>
        <p>
          {actorMode === "admin"
            ? "Archived by the rep. They must restore it to their Prospects list before pipeline work can continue."
            : "Hidden from your active Prospects list. Restore to continue working this prospect."}
        </p>
        <p className="text-xs">
          Marked {format(new Date(lead.notInterestedAt), "d MMM yyyy, h:mm a")}
        </p>
        {lead.notInterestedNote ? (
          <p className="text-sm">
            <span className="font-bold">Note:</span> {lead.notInterestedNote}
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
          <Button asChild variant="ghost" className="min-h-11 font-bold uppercase">
            <Link to="/portal/pipeline/not-interested">View not interested list</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
