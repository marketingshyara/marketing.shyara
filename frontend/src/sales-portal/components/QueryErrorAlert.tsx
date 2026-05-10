import { Button } from "@/components/ui/button";

export function QueryErrorAlert({
  message,
  onRetry
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-md border border-destructive/45 bg-destructive/[0.08] px-4 py-3 text-sm dark:border-destructive/50 dark:bg-destructive/15">
      <p className="font-medium text-destructive">{message}</p>
      <Button type="button" variant="outline" size="sm" className="mt-2 min-h-11" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
