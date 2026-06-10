import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "../../types";
import { interestedSampleLabel, prospectCategoryLabel } from "../../lib/leadProspectCategory";

type Props = {
  lead: Pick<Lead, "prospectCategory" | "callbackScheduledAt" | "interestedSampleShared" | "convertedAt">;
};

export function ProspectCategoryBadge({ lead }: Props) {
  if (lead.convertedAt != null) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary" className="font-bold uppercase tracking-wide">
        {prospectCategoryLabel(lead.prospectCategory)}
      </Badge>
      {lead.prospectCategory === "CALLBACK_REQUESTED" && lead.callbackScheduledAt ? (
        <Badge variant="outline" className="tabular-nums">
          {format(new Date(lead.callbackScheduledAt), "d MMM, h:mm a")}
        </Badge>
      ) : null}
      {lead.prospectCategory === "INTERESTED" && lead.interestedSampleShared != null ? (
        <Badge variant={lead.interestedSampleShared ? "default" : "outline"}>
          {interestedSampleLabel(lead.interestedSampleShared)}
        </Badge>
      ) : null}
    </div>
  );
}
