import { cn } from "@/lib/utils";
import { declineFeedbackMessage } from "../../lib/declineFeedback";
import { PORTAL_WAITING_BANNER, PORTAL_WAITING_TEXT } from "../../theme/statusColors";

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
        "border-l-[4px] border-l-[#FF3333] px-4 py-3 text-sm shadow-[2px_2px_0_0_#0A0A0A]",
        PORTAL_WAITING_BANNER,
        className
      )}
    >
      <p className="font-bold uppercase tracking-wide">
        {stageTitle} — needs your attention
      </p>
      <p className={cn("mt-1", PORTAL_WAITING_TEXT)}>{message}</p>
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
    <p className={cn("text-sm", PORTAL_WAITING_TEXT, className)} role="status">
      <span className="font-bold">Admin declined: </span>
      {declineFeedbackMessage(declineNote)}
    </p>
  );
}
