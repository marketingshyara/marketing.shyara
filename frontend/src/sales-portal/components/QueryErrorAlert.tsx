import { Button } from "@/components/ui/button";

export function QueryErrorAlert({
  message,
  onRetry,
  hint
}: {
  message: string;
  onRetry: () => void;
  hint?: string;
}) {
  return (
    <div
      className="border-2 border-[#0A0A0A] border-l-[4px] border-l-[#FF3333] bg-white px-4 py-3 text-sm shadow-[2px_2px_0_0_#0A0A0A]"
      role="alert"
      aria-live="polite"
    >
      <p className="font-bold uppercase tracking-wide text-[#FF3333]">{message}</p>
      <p className="mt-1 text-[#0A0A0A]/60">
        {hint ?? "Try again. If the issue continues, contact your administrator."}
      </p>
      <Button type="button" variant="outline" size="sm" className="mt-3 min-h-11" onClick={onRetry}>
        Retry Now
      </Button>
    </div>
  );
}
