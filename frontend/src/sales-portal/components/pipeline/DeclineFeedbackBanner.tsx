import { cn } from "@/lib/utils";
import { declineFeedbackMessage } from "../../lib/declineFeedback";

type Props = {
  stageTitle: string;
  declineNote: string | null;
  className?: string;
};

export function DeclineFeedbackBanner({ stageTitle, declineNote, className }: Props) {
  const message = declineFeedbackMessage(declineNote);

  return (
    <div
      role="status"
      className={cn(
        "rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm",
        className
      )}
    >
      <p className="font-medium text-amber-950 dark:text-amber-100">
        {stageTitle} — needs your attention
      </p>
      <p className="mt-1 text-muted-foreground">{message}</p>
    </div>
  );
}

export function DeclineFeedbackInline({
  declineNote,
  className
}: {
  declineNote: string | null;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-amber-800 dark:text-amber-200", className)} role="status">
      <span className="font-medium">Admin declined: </span>
      {declineFeedbackMessage(declineNote)}
    </p>
  );
}
