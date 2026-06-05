import { Button } from "@/components/ui/button";
import { useRestoreLeadInterestMutation } from "../../hooks/useSalesQueries";

type Props = {
  leadId: string;
  clientName: string;
  onRestored?: () => void;
};

export function RestoreLeadButton({ leadId, clientName, onRestored }: Props) {
  const restore = useRestoreLeadInterestMutation();

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11 w-full sm:w-auto"
      aria-label={`Restore ${clientName} to Prospects`}
      disabled={restore.isPending}
      onClick={() =>
        restore.mutate(leadId, {
          onSuccess: () => onRestored?.()
        })
      }
    >
      {restore.isPending ? "Restoring…" : "Restore to Prospects"}
    </Button>
  );
}
