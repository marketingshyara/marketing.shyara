import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDeleteLeadMutation } from "../../hooks/useSalesQueries";
import {
  portalDestructiveButtonClass,
  portalDestructiveIconButtonClass,
  TwoStepDestructiveDialog
} from "../ui/TwoStepDestructiveDialog";

type Props = {
  leadId: string;
  clientName: string;
  variant?: "icon" | "destructive" | "listRow";
  onDeleted?: () => void;
};

export function DeleteProspectButton({
  leadId,
  clientName,
  variant = "icon",
  onDeleted
}: Props) {
  const [open, setOpen] = useState(false);
  const del = useDeleteLeadMutation();

  const handleConfirm = () => {
    del.mutate(leadId, {
      onSuccess: () => {
        setOpen(false);
        onDeleted?.();
      }
    });
  };

  const trigger =
    variant === "icon" ? (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("min-h-11 min-w-11", portalDestructiveIconButtonClass)}
        aria-label={`Delete prospect ${clientName}`}
        disabled={del.isPending}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </Button>
    ) : variant === "listRow" ? (
      <Button
        type="button"
        variant="destructive"
        className={cn("min-h-11", portalDestructiveButtonClass)}
        disabled={del.isPending}
      >
        Delete
      </Button>
    ) : (
      <Button
        type="button"
        variant="destructive"
        className={cn("min-h-11 w-full sm:w-auto", portalDestructiveButtonClass)}
        disabled={del.isPending}
      >
        Delete prospect
      </Button>
    );

  return (
    <TwoStepDestructiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      step1={{
        title: "Delete this prospect?",
        description: (
          <>
            You are about to delete{" "}
            <span className="font-semibold text-foreground">{clientName}</span>. This removes the
            prospect and any pending payment records from your pipeline.
          </>
        )
      }}
      step2={{
        title: "Permanently delete prospect?",
        description: (
          <>
            Last chance: delete{" "}
            <span className="font-semibold text-foreground">{clientName}</span> forever? No admin
            approval is required, and you cannot restore this prospect afterward.
          </>
        )
      }}
      confirmLabel="Yes, delete permanently"
      pendingLabel="Deleting…"
      onConfirm={handleConfirm}
      isPending={del.isPending}
    />
  );
}
