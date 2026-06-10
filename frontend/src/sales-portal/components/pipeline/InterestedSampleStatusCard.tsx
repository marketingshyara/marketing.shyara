import { Button } from "@/components/ui/button";
import { interestedSampleLabel } from "../../lib/leadProspectCategory";
import type { Lead } from "../../types";
import { useSetProspectCategoryMutation } from "../../hooks/useSalesQueries";
import { PORTAL_ACTION_BANNER } from "../../theme/statusColors";
import { cn } from "@/lib/utils";

type Props = {
  lead: Pick<Lead, "id" | "clientName" | "prospectCategory" | "interestedSampleShared">;
  onUpdated?: () => void;
  readOnly?: boolean;
};

export function InterestedSampleStatusCard({ lead, onUpdated, readOnly = false }: Props) {
  const setCategory = useSetProspectCategoryMutation();

  if (lead.prospectCategory !== "INTERESTED") return null;

  const shared = lead.interestedSampleShared;
  const canMarkShared = shared === false && !readOnly;
  const canMarkPending = shared === true && !readOnly;

  const handleMarkShared = () => {
    setCategory.mutate(
      { leadId: lead.id, category: "INTERESTED", sampleShared: true, sampleOnly: true },
      { onSuccess: () => onUpdated?.() }
    );
  };

  const handleMarkPending = () => {
    setCategory.mutate(
      { leadId: lead.id, category: "INTERESTED", sampleShared: false, sampleOnly: true },
      { onSuccess: () => onUpdated?.() }
    );
  };

  return (
    <div className={cn("space-y-3 px-4 py-3 shadow-[2px_2px_0_0_#0A0A0A]", PORTAL_ACTION_BANNER)} role="status">
      <div className="space-y-1 text-sm">
        <p className="font-bold uppercase tracking-wide">Website sample</p>
        <p>{interestedSampleLabel(shared)}</p>
        {shared === false ? (
          <p className="text-xs text-muted-foreground">
            Update when you have shared the website sample with this prospect.
          </p>
        ) : null}
      </div>
      {canMarkShared || canMarkPending ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {canMarkShared ? (
            <Button
              type="button"
              className="min-h-11 w-full sm:w-auto"
              disabled={setCategory.isPending}
              onClick={handleMarkShared}
            >
              {setCategory.isPending ? "Saving…" : "Mark sample shared"}
            </Button>
          ) : null}
          {canMarkPending ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              disabled={setCategory.isPending}
              onClick={handleMarkPending}
            >
              {setCategory.isPending ? "Saving…" : "Mark as not shared yet"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
