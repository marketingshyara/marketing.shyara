import { formatDistanceToNowStrict } from "date-fns";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  dataUpdatedAt: number;
  onRefresh: () => void | Promise<void>;
  isFetching: boolean;
  disabled?: boolean;
};

/**
 * Shows last successful fetch time and a manual refresh control for field teams on slow networks.
 */
export function DataStaleToolbar({ dataUpdatedAt, onRefresh, isFetching, disabled }: Props) {
  const label =
    dataUpdatedAt > 0
      ? formatDistanceToNowStrict(new Date(dataUpdatedAt), {
          addSuffix: true
        })
      : "—";

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>Updated {label}</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-9"
        onClick={() => void onRefresh()}
        disabled={disabled || isFetching}
        aria-label="Refresh data"
      >
        <RefreshCw className={`mr-1 h-3 w-3 ${isFetching ? "animate-spin" : ""}`} aria-hidden />
        Refresh
      </Button>
    </div>
  );
}
