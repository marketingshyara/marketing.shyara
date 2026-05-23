import { memo, useCallback, useMemo } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "../../lib/copyToClipboard";

type Props = {
  value: string | null | undefined;
  emptyLabel?: string;
  /** Toast label when copied */
  copyLabel: string;
  className?: string;
  variant?: "default" | "plain";
  monospace?: boolean;
  "aria-describedby"?: string;
};

export const PortalCopyableText = memo(function PortalCopyableText({
  value,
  emptyLabel = "—",
  copyLabel,
  className,
  variant = "default",
  monospace = false,
  "aria-describedby": ariaDescribedBy
}: Props) {
  const raw = useMemo(() => value?.trim() ?? "", [value]);

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
      <span
        className={cn(
          "inline-flex min-h-11 min-w-0 flex-1 items-center break-all rounded-md border bg-background px-3 py-2.5 text-sm leading-snug",
          monospace && "font-mono"
        )}
      >
        {raw}
      </span>
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
