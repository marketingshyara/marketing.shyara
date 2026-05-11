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
      className="rounded-md border border-destructive/45 bg-destructive/[0.08] px-4 py-3 text-sm dark:border-destructive/50 dark:bg-destructive/15"
      role="alert"
      aria-live="polite"
    >
      <p className="font-medium text-destructive">{message}</p>
      <p className="mt-1 text-muted-foreground">
        {hint ?? "Try again. If the issue continues, contact your administrator."}
      </p>
      <Button type="button" variant="outline" size="sm" className="mt-3 min-h-11" onClick={onRetry}>
        Retry Now
      </Button>
    </div>
  );
}
