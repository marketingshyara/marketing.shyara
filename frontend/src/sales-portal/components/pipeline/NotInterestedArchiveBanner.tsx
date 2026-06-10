import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Lead } from "../../types";
import { isProspectArchived } from "../../lib/leadProspectCategory";
import { SetProspectCategoryDialog } from "./SetProspectCategoryDialog";
import { cn } from "@/lib/utils";
import { PORTAL_WAITING_BANNER, PORTAL_WAITING_TEXT } from "../../theme/statusColors";

type Props = {
  lead: Lead;
  onRestored?: () => void;
  /** Admin timeline opens read-only; only the rep can restore. */
  actorMode?: "rep" | "admin";
};

export function NotInterestedArchiveBanner({ lead, onRestored, actorMode = "rep" }: Props) {
  if (!isProspectArchived(lead)) return null;

  return (
    <div className={cn("space-y-3 px-4 py-3 shadow-[2px_2px_0_0_#0A0A0A]", PORTAL_WAITING_BANNER)} role="status">
      <div className={cn("space-y-1 text-sm", PORTAL_WAITING_TEXT)}>
        <p className="font-bold uppercase tracking-wide text-[#0A0A0A]">Marked not interested</p>
        <p>
          {actorMode === "admin"
            ? "Archived by the rep. Change category to resume pipeline work."
            : "Hidden from your active Prospects sub-tabs. Change category to continue working this prospect."}
        </p>
      </div>
      {actorMode === "rep" ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <SetProspectCategoryDialog
            leadId={lead.id}
            clientName={lead.clientName}
            lead={lead}
            defaultCategory="FOLLOW_UP"
            triggerLabel="Change category"
            onUpdated={() => onRestored?.()}
          />
          <Button asChild variant="ghost" className="min-h-11 font-bold uppercase">
            <Link to="/portal/pipeline?view=leads&prospectCategory=NOT_INTERESTED">
              View not interested list
            </Link>
          </Button>
        </div>
      ) : (
        <SetProspectCategoryDialog
          leadId={lead.id}
          clientName={lead.clientName}
          lead={lead}
          defaultCategory="FOLLOW_UP"
          triggerLabel="Change category"
          onUpdated={() => onRestored?.()}
        />
      )}
    </div>
  );
}
