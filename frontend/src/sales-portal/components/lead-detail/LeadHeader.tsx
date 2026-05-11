import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "../../types";
import { leadStatusLabel } from "../../lib/copy";

type Props = {
  status: LeadStatus;
  terminal: boolean;
};

/**
 * Header row for the lead detail page. Renders the back link, the status badge, and a "(read-only)"
 * hint when the lead is in a terminal state. Status changes are announced via aria-live so screen
 * readers pick up transitions without forcing a page focus jump.
 */
export function LeadHeader({ status, terminal }: Props) {
  const statusLabel = leadStatusLabel(status);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary" role="status" aria-live="polite">
        {statusLabel}
      </Badge>
      {terminal && (
        <span className="text-sm text-muted-foreground" aria-live="polite">
          (read-only)
        </span>
      )}
    </div>
  );
}
