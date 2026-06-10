import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryErrorAlert } from "../QueryErrorAlert";
import { useProspectCategoryEventsQuery } from "../../hooks/useSalesQueries";
import {
  prospectCategoryEventDetail,
  prospectCategoryLabel
} from "../../lib/leadProspectCategory";

type Props = {
  leadId: string;
};

export function ProspectCategoryTimeline({ leadId }: Props) {
  const qr = useProspectCategoryEventsQuery(leadId);

  if (qr.isError) {
    return (
      <QueryErrorAlert
        message="Could not load category history."
        onRetry={() => void qr.refetch()}
      />
    );
  }

  if (qr.isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  const items = qr.data?.items ?? [];
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No category history yet.</p>;
  }

  return (
    <ol className="space-y-3 border-l-2 border-[#0A0A0A] pl-4">
      {items.map((event) => {
        const actor = event.createdBy.displayName?.trim() || event.createdBy.email;
        const detail = prospectCategoryEventDetail(event.category, event);
        return (
          <li key={event.id} className="relative space-y-1 text-sm">
            <span
              className="absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#0A0A0A] bg-white"
              aria-hidden
            />
            <p className="font-bold">{prospectCategoryLabel(event.category)}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(event.createdAt), "d MMM yyyy, h:mm a")} · {actor}
            </p>
            {detail ? <p className="text-sm text-muted-foreground">{detail}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
