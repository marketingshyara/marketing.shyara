import { memo } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatMinorUnits } from "../../lib/money";

type Props = {
  id: string;
  label: string;
  amountCents: number | null | undefined;
  hint?: string;
  missingMessage?: string;
  className?: string;
};

export const DealAmountField = memo(function DealAmountField({
  id,
  label,
  amountCents,
  hint,
  missingMessage = "Deal amount is not set. Complete convert with an agreed total first.",
  className
}: Props) {
  const missing = amountCents == null || amountCents <= 0;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <output
        id={id}
        className={cn(
          "flex min-h-11 w-full min-w-0 items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-base font-medium tabular-nums md:text-sm",
          missing && "text-muted-foreground"
        )}
      >
        {formatMinorUnits(amountCents)}
      </output>
      {hint ? (
        <p className="break-words text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {missing ? (
        <p className="break-words text-xs text-amber-700 dark:text-amber-300" role="status">
          {missingMessage}
        </p>
      ) : null}
    </div>
  );
});
