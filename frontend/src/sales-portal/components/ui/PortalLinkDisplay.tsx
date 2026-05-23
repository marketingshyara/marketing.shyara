import { memo, useCallback, useMemo } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "../../lib/copyToClipboard";
import { tryNormalizeHttpUrl } from "../../lib/httpUrl";

type Props = {
  url: string | null | undefined;
  emptyLabel?: string;
  /** Toast label when copied, e.g. "Group link" */
  copyLabel?: string;
  className?: string;
  /** Plain: no outer panel (use inside PortalMetaGrid). Default: bordered panel. */
  variant?: "default" | "plain";
  "aria-describedby"?: string;
};

export const PortalLinkDisplay = memo(function PortalLinkDisplay({
  url,
  emptyLabel = "—",
  copyLabel = "Link",
  className,
  variant = "default",
  "aria-describedby": ariaDescribedBy
}: Props) {
  const raw = useMemo(() => url?.trim() ?? "", [url]);
  const href = useMemo(() => (raw ? tryNormalizeHttpUrl(raw) : null), [raw]);

  const handleCopy = useCallback(() => {
    void copyToClipboard(raw, copyLabel);
  }, [raw, copyLabel]);

  if (!raw) {
    return <span className={cn("text-muted-foreground", className)}>{emptyLabel}</span>;
  }

  const row = (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3",
        className
      )}
      aria-describedby={ariaDescribedBy}
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex min-h-11 min-w-0 flex-1 touch-manipulation items-center gap-2 break-all",
            "rounded-md border bg-background px-3 py-2.5 text-primary underline-offset-4",
            "hover:bg-muted/50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-sm leading-snug">{raw}</span>
        </a>
      ) : (
        <span className="min-w-0 flex-1 break-all rounded-md border bg-background px-3 py-2.5 text-sm">
          {raw}
        </span>
      )}
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full shrink-0 touch-manipulation sm:w-auto sm:px-3"
        aria-label={`Copy ${copyLabel}`}
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4 shrink-0" aria-hidden />
        <span className="ml-2 sm:hidden">Copy</span>
      </Button>
    </div>
  );

  if (variant === "plain") {
    return row;
  }

  return <div className="rounded-lg border bg-muted/30 p-3">{row}</div>;
});
